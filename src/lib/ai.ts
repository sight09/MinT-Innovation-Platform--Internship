// MInT Platform — AI Services (Mock/Demo mode with full architecture)

import { prisma } from '@/lib/prisma'

// ─── MOCK KNOWLEDGE BASE ─────────────────────────────────────────────────────

const MOCK_KNOWLEDGE: Array<{ content: string; title: string; sourceType: string }> = [
  {
    title: 'Ethiopian Start-up Businesses Proclamation No. 1396/2025',
    sourceType: 'proclamation',
    content: `Ethiopian Start-up Businesses Proclamation No. 1396/2025. A "startup" means an enterprise that has limited business history, creates economic value through innovative, technology-enabled, and scalable products or services, and has been formally designated by the Ministry of Innovation and Technology (MInT). Designated startups are eligible for income tax exemptions, dividend tax exemptions, access to national fund of funds, startup-focused grants, credit guarantee schemes, and loss carry-forward provisions of up to three years.`,
  },
  {
    title: 'MInT Innovation Programs',
    sourceType: 'policy',
    content: `MInT runs several programs: StartupET (official startup registration platform), MInT Innovation Fund (seed funding), iCog-Powered AI Lab (AI startups), Digital Innovation Hubs (physical startup spaces), and Mentor Connect Program (linking startups with experienced mentors).`,
  },
  {
    title: 'Digital Ethiopia 2025 Strategy',
    sourceType: 'policy',
    content: `The Digital Ethiopia 2025 strategy aims to digitally transform Ethiopia's economy. Key pillars: Digital Infrastructure, Digital Government, Digital Economy, Digital Society, and Digital Innovation & Entrepreneurship. Led by the Ministry of Innovation and Technology (MInT).`,
  },
  {
    title: 'Startup Designation Application Process',
    sourceType: 'proclamation',
    content: `To apply for startup designation under Proclamation 1396/2025: submit application to MInT through the StartupET portal. Required documents: business registration certificate, business plan, evidence of innovative technology-enabled nature, team information. MInT shall process applications within 30 working days. Designation is valid for 3 years and is renewable.`,
  },
  {
    title: 'Platform Usage Guide',
    sourceType: 'platform',
    content: `To register your startup on MInT Innovation Platform: click "Register" and select "Startup" role. Verify your email with OTP. Complete your startup profile with problem statement, solution, team, and funding details. Submit for MInT review. Once approved, your startup is discoverable by mentors and investors.`,
  },
]

// ─── SEMANTIC SEARCH (Keyword-based for demo) ─────────────────────────────────

function retrieveRelevantChunks(query: string, topK = 3) {
  const queryLower = query.toLowerCase()
  
  // Score each knowledge item by keyword overlap
  const scored = MOCK_KNOWLEDGE.map((item) => {
    const contentLower = item.content.toLowerCase()
    const titleLower = item.title.toLowerCase()
    
    const words = queryLower.split(/\s+/).filter(w => w.length > 3)
    let score = 0
    for (const word of words) {
      if (contentLower.includes(word)) score += 2
      if (titleLower.includes(word)) score += 3
    }
    
    // Boost specific topic matches
    if (queryLower.includes('proclamation') && item.sourceType === 'proclamation') score += 5
    if (queryLower.includes('register') && item.sourceType === 'platform') score += 5
    if (queryLower.includes('mint') && item.sourceType === 'policy') score += 3
    if (queryLower.includes('tax') && item.content.includes('tax')) score += 4
    if (queryLower.includes('startup') && item.content.includes('startup')) score += 2
    
    return { item, score }
  })
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.item)
}

// ─── RESPONSE TEMPLATES ───────────────────────────────────────────────────────

function buildAiResponse(query: string, context: typeof MOCK_KNOWLEDGE): string {
  const queryLower = query.toLowerCase()
  
  // Platform usage questions
  if (queryLower.includes('register') || queryLower.includes('sign up') || queryLower.includes('create account')) {
    return `To register on the **MInT Innovation Platform**:

1. Click **"Register"** on the homepage or navigation bar
2. Select your role: **Startup**, **Investor**, or **Mentor**
3. Fill in your name, email, and create a secure password
4. Verify your email using the **OTP code** sent to your inbox
5. Complete your profile (startup details, investment preferences, or mentor background)
6. For **Startups**: Submit your startup for MInT review and approval

Once approved, your startup will be discoverable by verified MInT mentors and investors on the platform.

*Need help? Use the "Submit Your Startup" button on the homepage to get started quickly.*`
  }
  
  if (queryLower.includes('readiness') || queryLower.includes('score') || queryLower.includes('improve')) {
    return `## Startup Readiness Score

Your **Readiness Score** (0–100) reflects how prepared your startup is for mentorship, investment, and scaling. It's calculated across 6 dimensions:

| Dimension | Weight |
|-----------|--------|
| Problem Clarity | 20% |
| Innovation | 15% |
| Market Validation | 20% |
| Business Model | 15% |
| Team Readiness | 15% |
| Mentor Engagement | 15% |

**To improve your score:**
- ✅ Complete all sections of your startup profile
- ✅ Provide specific data (user numbers, revenue, market size)
- ✅ Engage actively with mentor questions — respond promptly
- ✅ Upload a pitch deck and supporting documents
- ✅ Define a clear, validated problem with evidence
- ✅ Document your traction metrics

*Readiness scores are AI-assisted indicators. Official evaluation is conducted by verified MInT mentors.*`
  }
  
  if (queryLower.includes('proclamation') || queryLower.includes('law') || queryLower.includes('legal') || queryLower.includes('designation')) {
    const procContent = context.find(c => c.sourceType === 'proclamation')
    return `## Ethiopian Start-up Businesses Proclamation No. 1396/2025

${procContent ? `According to the official proclamation: "${procContent.content}"` : ''}

**Key Benefits for Designated Startups:**
- 📋 **Income Tax Exemption** during the designation period
- 💰 **Access to National Fund of Funds** and startup grants
- 🏦 **Credit Guarantee Schemes** for easier access to financing
- 📅 **3-Year Loss Carry-Forward** provisions
- ⚡ **Streamlined Licensing** and regulatory processes

**How to Get Designated:**
Apply through the **StartupET portal** (managed by MInT). MInT processes applications within **30 working days**. Designation is valid for **3 years** and renewable.

> ⚠️ *This is an informational summary. For official legal advice or to begin the designation process, contact MInT directly at contact@mint.gov.et.*

**Source:** Ethiopian Start-up Businesses Proclamation No. 1396/2025`
  }
  
  if (queryLower.includes('investor') || queryLower.includes('investment') || queryLower.includes('funding') || queryLower.includes('pitch')) {
    return `## Preparing for Investors

Here's how to maximize your chances of attracting investors on the MInT platform:

**1. Strengthen Your Problem Statement**
- Use specific data and statistics (not "many people" but "12 million households")
- Show you have validated the problem with real target users

**2. Demonstrate Traction**
- Even small numbers matter: 50 paying users > 0 users
- Show growth rate, not just absolute numbers

**3. Build a Clear Business Model**
- Explain exactly how you make money
- Show unit economics (cost to acquire a customer vs. lifetime value)

**4. Engage with Mentors**
- High mentor engagement scores signal seriousness
- Answer all mentor questions thoroughly and promptly

**5. Complete Your Profile**
- Upload a pitch deck
- Fill in all team member profiles
- Provide specific funding ask with clear use-of-funds breakdown

**6. Improve Your Readiness Score**
- Investors can see your score and mentor evaluations
- A score of 75+ signals investment readiness

*Investors on this platform express "Investment Interest" — this notifies you and opens a conversation. No direct financial transactions occur on the platform.*`
  }
  
  if (queryLower.includes('what is mint') || queryLower.includes('about mint') || queryLower.includes('ministry')) {
    return `## Ministry of Innovation and Technology (MInT)

**MInT** is Ethiopia's lead government body for science, technology, and innovation. 

**Key Responsibilities:**
- 🏛️ Formulating and implementing technology policy
- 🌐 Managing the national ICT infrastructure  
- 🔄 Promoting digital transformation across Ethiopia
- 🚀 Supporting startup ecosystem development
- 📡 Regulating the telecommunications sector
- 🌍 Coordinating Ethiopia's international technology partnerships

**Innovation Programs:**
- **StartupET** — official startup registration and support portal
- **MInT Innovation Fund** — seed funding for early-stage startups
- **Digital Innovation Hubs** — physical startup spaces across Ethiopia
- **Mentor Connect Program** — linking startups with experienced mentors

**Digital Ethiopia 2025:**
MInT leads the Digital Ethiopia 2025 strategy, aiming to build a knowledge-based, innovation-driven society through 5 pillars: Digital Infrastructure, Digital Government, Digital Economy, Digital Society, and Digital Innovation & Entrepreneurship.

**Contact:** contact@mint.gov.et | www.mint.gov.et

*Source: Ministry of Innovation and Technology, Digital Ethiopia 2025 Strategic Framework*`
  }
  
  // Generic response with context
  const contextText = context.map(c => c.content).join('\n\n')
  
  return `Based on information from MInT and the Ethiopian innovation ecosystem:

${context.length > 0 ? `**Relevant information:**\n${contextText}\n\n` : ''}**I can help you with:**
- 🚀 Startup registration and profile setup
- 📋 Ethiopian startup proclamation and designation process
- 💡 Improving your startup readiness score
- 🎯 Preparing for mentor evaluations and investor pitches
- 📊 Understanding MInT programs and resources
- 📖 Platform usage guidance

*Try asking: "What does the Ethiopian startup proclamation say?" or "How do I prepare for investors?" or "Analyze my startup."*

> ℹ️ *For official regulatory guidance or legal interpretation, please consult MInT directly. This AI assistant provides informational support only.*`
}

// ─── MAIN CHAT API ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
  sources: Array<{
    title: string
    excerpt: string
    sourceType: string
  }>
}

export async function processChatMessage(
  query: string,
  _history: ChatMessage[] = [],
  _conversationId?: string
): Promise<ChatResponse> {
  // Retrieve relevant knowledge chunks
  const relevantChunks = retrieveRelevantChunks(query, 3)
  
  // Build response
  const content = buildAiResponse(query, relevantChunks)
  
  const sources = relevantChunks.map(chunk => ({
    title: chunk.title,
    excerpt: chunk.content.substring(0, 150) + '...',
    sourceType: chunk.sourceType,
  }))
  
  return { content, sources }
}

// ─── STARTUP ANALYSIS ─────────────────────────────────────────────────────────

export interface StartupAnalysis {
  strengths: string[]
  weaknesses: string[]
  missingInfo: string[]
  recommendations: string[]
  potentialMentorQuestions: string[]
  investorReadinessTips: string[]
  overallAssessment: string
}

export async function analyzeStartup(startupId: string): Promise<StartupAnalysis> {
  const startup = await prisma.startupProfile.findUnique({
    where: { id: startupId },
    include: {
      teamMembers: true,
      startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
    },
  })

  if (!startup) throw new Error('Startup not found')

  const strengths: string[] = []
  const weaknesses: string[] = []
  const missingInfo: string[] = []
  const recommendations: string[] = []
  const potentialMentorQuestions: string[] = []
  const investorReadinessTips: string[] = []

  // Problem analysis
  if (startup.problemStatement && startup.problemStatement.length > 200) {
    strengths.push('Detailed problem statement provided')
  } else {
    weaknesses.push('Problem statement lacks depth and supporting evidence')
    recommendations.push('Expand your problem statement with specific data, statistics, and user research')
  }

  if (startup.problemSignificance) {
    strengths.push('Problem significance documented — shows market awareness')
  } else {
    missingInfo.push('Problem significance/impact not specified')
    potentialMentorQuestions.push('How many people does this problem affect, and what is the economic impact?')
  }

  // Solution analysis
  if (startup.solutionDescription) {
    strengths.push('Solution description is present')
  } else {
    missingInfo.push('Solution description not completed')
  }

  if (startup.uniqueValueProp) {
    strengths.push('Unique value proposition articulated')
  } else {
    weaknesses.push('Unique value proposition not defined')
    recommendations.push('Clearly state what makes your solution different from existing alternatives')
  }

  // Market analysis
  if (startup.marketSize) {
    strengths.push('Market size estimated')
  } else {
    missingInfo.push('Market size not defined')
    potentialMentorQuestions.push('What is the total addressable market, and how did you estimate it?')
  }

  if (startup.businessModel) {
    strengths.push('Business model documented')
  } else {
    weaknesses.push('Business model not defined — this is critical for investors')
    recommendations.push('Define your revenue model clearly: subscription, commission, transaction fee, etc.')
    potentialMentorQuestions.push('How do you make money? What is your primary revenue stream?')
  }

  // Traction analysis
  if (startup.userCount && startup.userCount > 0) {
    strengths.push(`Traction demonstrated: ${startup.userCount.toLocaleString()} users`)
  } else if (startup.stage !== 'IDEA') {
    weaknesses.push('No user/customer traction documented despite being beyond Idea stage')
    potentialMentorQuestions.push('Who have you talked to about this problem? What did they say?')
  }

  if (startup.currentTraction) {
    strengths.push('Current traction metrics documented')
  } else {
    missingInfo.push('Traction metrics not documented')
  }

  // Team analysis
  if (startup.teamMembers.length === 0) {
    weaknesses.push('Team not profiled — investors evaluate the team as much as the idea')
    recommendations.push('Add all co-founders and key team members with their backgrounds and relevant experience')
    missingInfo.push('Team information not provided')
  } else {
    strengths.push(`Team documented: ${startup.teamMembers.length} member(s)`)
    const hasFounder = startup.teamMembers.some(m => m.isFounder)
    if (!hasFounder) {
      weaknesses.push('No founders marked — clarify founder roles')
    }
  }

  // Funding analysis
  if (startup.fundingRequired) {
    strengths.push(`Funding requirement specified: ${startup.fundingRequired.toLocaleString()} ${startup.fundingCurrency}`)
  } else {
    missingInfo.push('Funding requirement not specified')
    potentialMentorQuestions.push('How much funding are you seeking and what will you use it for?')
  }

  if (startup.fundingUse && startup.fundingUse.length > 50) {
    strengths.push('Use of funds clearly articulated')
  } else if (startup.fundingRequired) {
    weaknesses.push('Use of funds not clearly broken down by category')
    recommendations.push('Break down your funding requirements: engineering (X%), marketing (Y%), operations (Z%)')
  }

  // Needs analysis
  if (startup.mentorshipNeeds) {
    strengths.push('Mentorship needs clearly articulated — shows self-awareness')
  } else {
    missingInfo.push('Mentorship needs not specified')
  }

  // Investor readiness tips
  if (startup.stage === 'IDEA' || startup.stage === 'PROBLEM_VALIDATED') {
    investorReadinessTips.push('Focus on validating the problem before seeking investment')
    investorReadinessTips.push('Build a prototype and get 10-20 users before approaching investors')
  } else if (startup.stage === 'PROTOTYPE' || startup.stage === 'MVP') {
    investorReadinessTips.push('Show traction — even 100 active users is meaningful at this stage')
    investorReadinessTips.push('Define your unit economics clearly')
    investorReadinessTips.push('Build a financial model for next 18 months')
  } else {
    investorReadinessTips.push('Prepare investor-grade financial statements')
    investorReadinessTips.push('Define clear KPIs and show growth trends')
    investorReadinessTips.push('Establish board of advisors with credible names')
  }

  investorReadinessTips.push('Engage actively with MInT mentors — mentor scores influence investor decisions')
  investorReadinessTips.push('Upload a compelling pitch deck (problem, solution, market, traction, team, ask)')

  // Add standard potential mentor questions
  potentialMentorQuestions.push('Who is your first target customer, and why?')
  potentialMentorQuestions.push('What is your biggest risk, and how are you mitigating it?')
  potentialMentorQuestions.push('How will you acquire your first 1,000 customers?')

  const overallAssessment = strengths.length > weaknesses.length
    ? `Strong foundation with ${strengths.length} clear strengths. Key areas for improvement: ${weaknesses.slice(0, 2).join('; ')}.`
    : `Good start, but significant gaps exist in: ${weaknesses.slice(0, 3).join('; ')}. Addressing these will significantly improve your readiness score.`

  return {
    strengths,
    weaknesses,
    missingInfo,
    recommendations,
    potentialMentorQuestions,
    investorReadinessTips,
    overallAssessment,
  }
}

// ─── READINESS SCORE COMPUTATION ─────────────────────────────────────────────

export async function computeReadinessScore(startupId: string) {
  const startup = await prisma.startupProfile.findUnique({
    where: { id: startupId },
    include: {
      teamMembers: true,
      documents: true,
      mentorReviews: { where: { status: 'PUBLISHED' } },
      mentorQuestions: true,
    },
  })

  if (!startup) return null

  let problemClarity = 0
  let innovationScore = 0
  let marketValidation = 0
  let businessModelScore = 0
  let teamScore = 0
  let mentorEngagement = 0

  // Problem clarity (0-100)
  if (startup.problemStatement) problemClarity += 30
  if (startup.problemStatement?.length > 200) problemClarity += 20
  if (startup.problemSignificance) problemClarity += 20
  if (startup.targetAudience) problemClarity += 15
  if (startup.uniqueValueProp) problemClarity += 15

  // Innovation (from mentor reviews or defaults)
  const avgReviewScore = startup.mentorReviews.length > 0
    ? startup.mentorReviews.reduce((acc, r) => acc + (Number(r.averageScore) || 0), 0) / startup.mentorReviews.length
    : null

  if (avgReviewScore) {
    innovationScore = Math.round((avgReviewScore / 10) * 100)
  } else {
    if (startup.solutionDescription) innovationScore += 40
    if (startup.uniqueValueProp) innovationScore += 30
    if (startup.competitorAnalysis) innovationScore += 30
  }

  // Market validation (0-100)
  if (startup.marketSize) marketValidation += 25
  if (startup.currentTraction) marketValidation += 25
  if (startup.userCount && startup.userCount > 0) marketValidation += 30
  if (startup.keyMetrics) marketValidation += 20

  // Business model (0-100)
  if (startup.businessModel) businessModelScore += 40
  if (startup.revenueModel) businessModelScore += 30
  if (startup.fundingRequired && startup.fundingUse) businessModelScore += 30

  // Team (0-100)
  if (startup.teamMembers.length > 0) teamScore += 40
  if (startup.teamMembers.length >= 2) teamScore += 20
  if (startup.teamMembers.some(m => m.isFounder)) teamScore += 20
  if (startup.teamMembers.some(m => m.bio && m.bio.length > 50)) teamScore += 20

  // Mentor engagement (0-100)
  if (startup.mentorReviews.length > 0) mentorEngagement += 50
  if (startup.mentorReviews.length >= 2) mentorEngagement += 20
  const answeredQuestions = startup.mentorQuestions.filter(q => q.isResolved).length
  const totalQuestions = startup.mentorQuestions.length
  if (totalQuestions > 0) {
    mentorEngagement += Math.round((answeredQuestions / totalQuestions) * 30)
  }
  if (startup.documents.length > 0) mentorEngagement += 20
  mentorEngagement = Math.min(100, mentorEngagement)

  // Overall (weighted)
  const overallScore = Math.round(
    problemClarity * 0.20 +
    innovationScore * 0.15 +
    marketValidation * 0.20 +
    businessModelScore * 0.15 +
    teamScore * 0.15 +
    mentorEngagement * 0.15
  )

  return {
    problemClarity: Math.min(100, problemClarity),
    innovationScore: Math.min(100, innovationScore),
    marketValidation: Math.min(100, marketValidation),
    businessModelScore: Math.min(100, businessModelScore),
    teamScore: Math.min(100, teamScore),
    mentorEngagement: Math.min(100, mentorEngagement),
    overallScore: Math.min(100, overallScore),
  }
}

// ─── INVESTOR MATCHING ────────────────────────────────────────────────────────

export async function computeInvestorMatch(
  investorId: string,
  startupId: string
): Promise<{ score: number; reasons: string[] }> {
  const [investor, startup] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { id: investorId } }),
    prisma.startupProfile.findUnique({
      where: { id: startupId },
      include: {
        startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        mentorReviews: { where: { status: 'PUBLISHED' } },
      },
    }),
  ])

  if (!investor || !startup) return { score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []

  // Sector match (30%)
  if (investor.preferredSectors.includes(startup.sector)) {
    score += 30
    reasons.push(`Matches your preferred sector: ${startup.sector}`)
  }

  // Stage match (20%)
  if (investor.preferredStages.includes(startup.stage)) {
    score += 20
    reasons.push(`Matches your preferred stage: ${startup.stage.replace(/_/g, ' ')}`)
  }

  // Funding range match (20%)
  if (startup.fundingRequired) {
    const funding = Number(startup.fundingRequired)
    const min = Number(investor.minInvestment || 0)
    const max = Number(investor.maxInvestment || Infinity)
    if (funding >= min && funding <= max * 1.5) {
      score += 20
      reasons.push('Funding requirement matches your investment range')
    }
  }

  // Readiness score (15%)
  const latestScore = startup.startupScores?.[0]
  if (latestScore && latestScore.overallScore >= 70) {
    score += 15
    reasons.push(`High readiness score: ${latestScore.overallScore}/100`)
  } else if (latestScore && latestScore.overallScore >= 50) {
    score += 8
  }

  // Mentor evaluation (15%)
  if (startup.mentorReviews && startup.mentorReviews.length > 0) {
    const avgMentorScore = startup.mentorReviews.reduce(
      (acc, r) => acc + Number(r.averageScore || 0), 0
    ) / startup.mentorReviews.length
    if (avgMentorScore >= 8) {
      score += 15
      reasons.push(`Strong mentor evaluation: ${avgMentorScore.toFixed(1)}/10`)
    } else if (avgMentorScore >= 6) {
      score += 8
      reasons.push(`Good mentor evaluation: ${avgMentorScore.toFixed(1)}/10`)
    }
  }

  return { score: Math.min(100, score), reasons }
}
