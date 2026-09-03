import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processChatMessage, analyzeStartup } from '@/lib/ai'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  mode: z.enum(['chat', 'analyze']).default('chat'),
  startupId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { message, conversationId, mode, startupId } = chatSchema.parse(body)

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const conv = await prisma.aiConversation.create({
        data: {
          userId: session?.user?.id,
          title: message.substring(0, 50),
        },
      })
      convId = conv.id
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: message,
      },
    })

    let responseContent: string
    let sources: Array<{ title: string; excerpt: string; sourceType: string }> = []

    if (mode === 'analyze' && startupId) {
      // Startup analysis mode
      const analysis = await analyzeStartup(startupId)
      responseContent = `## AI Startup Analysis

> ⚠️ *This analysis is AI-assisted and advisory only. Official evaluation is performed by verified MInT mentors.*

### ✅ Strengths
${analysis.strengths.map(s => `- ${s}`).join('\n')}

### ⚠️ Weaknesses
${analysis.weaknesses.map(w => `- ${w}`).join('\n')}

### 📋 Missing Information
${analysis.missingInfo.length > 0 ? analysis.missingInfo.map(m => `- ${m}`).join('\n') : '- No critical missing information'}

### 💡 Recommendations
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

### ❓ Questions a Mentor May Ask
${analysis.potentialMentorQuestions.map(q => `- "${q}"`).join('\n')}

### 💰 Investor Readiness Tips
${analysis.investorReadinessTips.map(t => `- ${t}`).join('\n')}

---

**Overall Assessment:** ${analysis.overallAssessment}`
    } else {
      // Get conversation history
      const history = await prisma.aiMessage.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: 'asc' },
        take: 10,
      })

      const result = await processChatMessage(
        message,
        history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      )
      responseContent = result.content
      sources = result.sources
    }

    // Save assistant response
    const assistantMessage = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: responseContent,
        sources: sources.length > 0 ? JSON.stringify(sources) : null,
      },
    })

    return NextResponse.json({
      conversationId: convId,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: responseContent,
        sources,
        createdAt: assistantMessage.createdAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 500 })
  }
}
