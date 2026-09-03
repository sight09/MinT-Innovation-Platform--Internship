import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MInT Innovation Platform Database...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.aiMessage.deleteMany()
  await prisma.aiConversation.deleteMany()
  await prisma.knowledgeDocument.deleteMany()
  await prisma.startupScore.deleteMany()
  await prisma.investmentInterest.deleteMany()
  await prisma.mentorQuestion.deleteMany()
  await prisma.mentorReview.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.startupDocument.deleteMany()
  await prisma.startupProfile.deleteMany()
  await prisma.mentorProfile.deleteMany()
  await prisma.investorProfile.deleteMany()
  await prisma.user.deleteMany()

  const defaultPasswordHash = await bcrypt.hash('Admin@MInT2025!', 10)
  const startupPasswordHash = await bcrypt.hash('Startup@2025!', 10)
  const mentorPasswordHash = await bcrypt.hash('Mentor@MInT2025!', 10)
  const investorPasswordHash = await bcrypt.hash('Investor@2025!', 10)

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mint.gov.et',
      passwordHash: defaultPasswordHash,
      firstName: 'MInT System',
      lastName: 'Administrator',
      role: 'MINT_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })
  console.log('✓ Admin user created:', adminUser.email)

  // 2. Create Mentor Users & Profiles
  const mentorUser1 = await prisma.user.create({
    data: {
      email: 'dr.ayele.bekele@mint.gov.et',
      passwordHash: mentorPasswordHash,
      firstName: 'Ayele',
      lastName: 'Bekele',
      role: 'MINT_MENTOR',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const mentorProfile1 = await prisma.mentorProfile.create({
    data: {
      userId: mentorUser1.id,
      title: 'Dr.',
      organization: 'Ministry of Innovation and Technology (MInT)',
      expertiseAreas: JSON.stringify(['AI & Machine Learning', 'Agritech', 'Software Architecture', 'IP & Patents']),
      sectorsOfInterest: JSON.stringify(['Agriculture', 'AI & Machine Learning', 'EdTech']),
      yearsExperience: 15,
      bio: 'Senior Technology Advisor at MInT with 15+ years in AI research and tech policy in East Africa.',
      isVerified: true,
      verifiedAt: new Date(),
    },
  })

  const mentorUser2 = await prisma.user.create({
    data: {
      email: 'selamawit.tadesse@mint.gov.et',
      passwordHash: mentorPasswordHash,
      firstName: 'Selamawit',
      lastName: 'Tadesse',
      role: 'MINT_MENTOR',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const mentorProfile2 = await prisma.mentorProfile.create({
    data: {
      userId: mentorUser2.id,
      title: 'Eng.',
      organization: 'Digital Transformation Institute',
      expertiseAreas: JSON.stringify(['FinTech', 'Digital Payments', 'Regulatory Compliance', 'Scale-up Strategy']),
      sectorsOfInterest: JSON.stringify(['FinTech', 'E-Commerce', 'Logistics']),
      yearsExperience: 12,
      bio: 'Former FinTech executive and advisor to National Bank of Ethiopia sandbox initiative.',
      isVerified: true,
      verifiedAt: new Date(),
    },
  })
  console.log('✓ Mentors created')

  // 3. Create Investor Users & Profiles
  const investorUser1 = await prisma.user.create({
    data: {
      email: 'habte.girma@ethiopianventures.com',
      passwordHash: investorPasswordHash,
      firstName: 'Habte',
      lastName: 'Girma',
      role: 'INVESTOR',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const investorProfile1 = await prisma.investorProfile.create({
    data: {
      userId: investorUser1.id,
      organizationName: 'Ethiopia Innovation Capital',
      investorType: 'Venture Capital',
      preferredSectors: JSON.stringify(['Agriculture', 'FinTech', 'HealthTech', 'Logistics']),
      preferredStages: JSON.stringify(['MVP', 'EARLY_TRACTION', 'GROWTH']),
      minInvestment: 500000,
      maxInvestment: 10000000,
      bio: 'Early-stage venture fund investing in technology-driven Ethiopian startups with scalable impact.',
      isVerified: true,
      verifiedAt: new Date(),
    },
  })
  console.log('✓ Investors created')

  // 4. Create Startup Users & Profiles
  // Startup 1: AgroMarket AI
  const founderUser1 = await prisma.user.create({
    data: {
      email: 'founder@agromarketai.et',
      passwordHash: startupPasswordHash,
      firstName: 'Dawit',
      lastName: 'Mulugeta',
      role: 'STARTUP',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const startup1 = await prisma.startupProfile.create({
    data: {
      userId: founderUser1.id,
      name: 'AgroMarket AI',
      tagline: 'Connecting smallholder farmers directly to fair markets using AI price intelligence',
      sector: 'Agriculture',
      stage: 'MVP',
      location: 'Addis Ababa / Bahir Dar',
      foundedYear: 2024,
      website: 'https://agromarketai.et',
      contactEmail: 'contact@agromarketai.et',
      contactPhone: '+251911223344',
      problemStatement: 'Smallholder teff and wheat farmers in Amhara and Oromia regions lose 35-45% of their farmgate potential revenue to middle-layer brokers due to severe information asymmetry on market clearing prices across regional markets.',
      problemSignificance: 'Over 12 million smallholder farming households in Ethiopia depend on agricultural sales, but market fragmentation leads to price exploitation and high post-harvest food waste.',
      targetAudience: 'Smallholder grain farmers, cooperative unions, regional grain traders, and institutional food buyers.',
      solutionDescription: 'AgroMarket AI provides a USSD/SMS price intelligence platform paired with an AI-driven matching engine that connects farm cooperatives directly with millers and institutional buyers at transparent spot prices.',
      uniqueValueProp: 'Offline USSD accessibility in Amharic and Afaan Oromo, real-time market price prediction model, and local language voice assistant for low-literacy farmers.',
      marketSize: 'Estimated $4.2B annual grain trade volume in Ethiopia with $350M addressable digital transaction fee market.',
      businessModel: '1.5% transaction facilitation fee on buyer side + premium predictive market reports for commercial traders.',
      revenueModel: 'Transaction-based commission and B2B subscription.',
      currentTraction: '14 agricultural cooperatives onboarded in Oromia region, 4,200 active farmer users, 18.5M ETB in grain trades facilitated over 6 months.',
      userCount: 4200,
      fundingRequired: 2000000,
      fundingCurrency: 'ETB',
      fundingUse: '60% software engineering & offline USSD scale, 25% cooperative onboarding field teams, 15% working capital.',
      mentorshipNeeds: 'Guidance on patenting our grain quality computer-vision model and navigating agricultural export compliance.',
      status: 'APPROVED',
      readinessScore: 82,
      approvedAt: new Date(),
    },
  })

  await prisma.teamMember.createMany({
    data: [
      { startupId: startup1.id, name: 'Dawit Mulugeta', role: 'CEO & Co-founder', isFounder: true, bio: 'Former Senior Software Engineer at Ethio Telecom with MSc in Computer Science from AAiT.' },
      { startupId: startup1.id, name: 'Hiwot Alemu', role: 'CTO & Co-founder', isFounder: true, bio: 'AI researcher specialized in NLP for Low-Resource Languages (Amharic/Oromo).' },
      { startupId: startup1.id, name: 'Tewodros Kassaye', role: 'Head of Field Operations', isFounder: false, bio: '10 years leading agricultural union extension services in West Shewa.' },
    ],
  })

  await prisma.startupScore.create({
    data: {
      startupId: startup1.id,
      problemClarity: 90,
      innovationScore: 80,
      marketValidation: 75,
      businessModelScore: 72,
      teamScore: 85,
      mentorEngagement: 88,
      overallScore: 82,
      aiInsightsJson: JSON.stringify({
        strengths: ['Strong localized problem validation with clear user data', 'Experienced technical team with NLP background'],
        weaknesses: ['Business model heavily relies on cooperative adoption speed'],
        recommendations: ['Formalize partnership with regional agriculture bureaus', 'Build pilot financial statements for investor presentation'],
      }),
    },
  })

  // Startup 2: HealthBridge Ethiopia
  const founderUser2 = await prisma.user.create({
    data: {
      email: 'contact@healthbridge.et',
      passwordHash: startupPasswordHash,
      firstName: 'Bethlehem',
      lastName: 'Tilahun',
      role: 'STARTUP',
      status: 'ACTIVE',
      emailVerified: true,
    },
  })

  const startup2 = await prisma.startupProfile.create({
    data: {
      userId: founderUser2.id,
      name: 'HealthBridge Ethiopia',
      tagline: 'Telemedicine and digital triage connecting rural clinics with specialist doctors',
      sector: 'HealthTech',
      stage: 'EARLY_TRACTION',
      location: 'Hawassa / Addis Ababa',
      foundedYear: 2023,
      website: 'https://healthbridge.et',
      problemStatement: 'Primary healthcare centers (PHCs) in rural Sidama and SNNPR lack access to specialist physicians, forcing patients to travel over 150km to regional hospitals for basic specialist consultations.',
      problemSignificance: 'Over 70% of Ethiopians live in rural areas with fewer than 1 specialist doctor per 100,000 population.',
      solutionDescription: 'Low-bandwidth digital triage and asynchronous consultation platform enabling rural health extension workers to capture patient vitals, ECGs, and imagery and consult Addis Ababa-based specialists within 2 hours.',
      uniqueValueProp: 'Operates on 2G/3G networks, offline-first mobile sync, integrated with Ministry of Health digital health registry.',
      marketSize: '$120M annual out-of-pocket health expenditure on medical travel and private clinic consultations.',
      businessModel: 'B2B subscription fee per rural clinic + per-consultation micro-fee.',
      currentTraction: 'Deployed across 18 rural health centers in Sidama region; 3,100 consultations completed; 88% reduction in unnecessary hospital transfers.',
      userCount: 3100,
      fundingRequired: 3500000,
      fundingCurrency: 'ETB',
      status: 'FEATURED',
      readinessScore: 85,
      featuredAt: new Date(),
      approvedAt: new Date(),
    },
  })

  await prisma.teamMember.createMany({
    data: [
      { startupId: startup2.id, name: 'Bethlehem Tilahun', role: 'CEO & Founder', isFounder: true, bio: 'Medical Doctor with MPH from Black Lion Hospital, 7 years clinical experience.' },
      { startupId: startup2.id, name: 'Kaleb Worku', role: 'Lead Architect', isFounder: false, bio: 'Ex-Ethio Telecom cloud infrastructure specialist.' },
    ],
  })

  await prisma.startupScore.create({
    data: {
      startupId: startup2.id,
      problemClarity: 95,
      innovationScore: 82,
      marketValidation: 88,
      businessModelScore: 78,
      teamScore: 90,
      mentorEngagement: 78,
      overallScore: 85,
      aiInsightsJson: JSON.stringify({
        strengths: ['High societal impact aligned with MoH digital health strategy', 'Founder is a medical doctor with deep clinical insight'],
        weaknesses: ['Requires regulatory approvals for cross-regional tele-prescriptions'],
        recommendations: ['Seek MInT Sandbox exemption for digital diagnostic protocols'],
      }),
    },
  })

  // 5. Create Reviews & Questions
  await prisma.mentorReview.create({
    data: {
      mentorId: mentorProfile1.id,
      startupId: startup1.id,
      problemSignificance: 9,
      problemClarity: 9,
      innovation: 8,
      technicalFeasibility: 8,
      marketPotential: 8,
      businessModel: 7,
      scalability: 8,
      teamReadiness: 9,
      traction: 8,
      overallReadiness: 8,
      averageScore: 8.2,
      generalFeedback: 'AgroMarket AI demonstrates exceptional understanding of agricultural supply chain dynamics in Ethiopia. The low-resource NLP integration for local languages is genuinely innovative.',
      strengths: 'Clear user demand, strong local language engineering, validated traction with cooperatives.',
      weaknesses: 'Monetization depends heavily on transaction volume; needs robust financial risk management.',
      recommendations: 'Expand cooperative partnerships into Arsi and West Gojjam zones; explore micro-insurance add-ons.',
      isFlagged: true,
      status: 'PUBLISHED',
      submittedAt: new Date(),
    },
  })

  await prisma.mentorQuestion.create({
    data: {
      mentorId: mentorProfile1.id,
      startupId: startup1.id,
      question: 'How do you handle price volatility when cooperatives lock in spot price agreements during peak harvest weeks?',
      answer: 'We utilize a 48-hour price corridor guarantee backed by partner grain processors who pre-commit liquidity for specified volumes.',
      answeredAt: new Date(),
      isResolved: true,
    },
  })

  await prisma.investmentInterest.create({
    data: {
      investorId: investorProfile1.id,
      startupId: startup1.id,
      message: 'We are very impressed by your traction in Oromia cooperatives. We would like to schedule an introductory pitch call regarding your seed round.',
      status: 'IN_DISCUSSION',
    },
  })

  // 6. Seed Knowledge Base for RAG
  await prisma.knowledgeDocument.createMany({
    data: [
      {
        title: 'Ethiopian Start-up Businesses Proclamation No. 1396/2025',
        sourceType: 'proclamation',
        content: `Ethiopian Start-up Businesses Proclamation No. 1396/2025. Objectives: Establish favorable regulatory framework, tax incentives, credit access, and innovation hubs for technology-enabled startups. Key definitions: Startup means an enterprise designated by MInT with innovative product, scalable model, and less than 5 years of operation. Benefits: Income tax exemption for up to 5 years, duty-free equipment imports, participation in public procurement, access to National Innovation Fund.`,
      },
      {
        title: 'Digital Ethiopia 2025 Strategy',
        sourceType: 'policy',
        content: `Digital Ethiopia 2025 Strategy. Four foundational pathways: Infrastructure, Digital ID, Digital Payments, Cyber Security. Priority sectors: Agriculture, Manufacturing, IT Enabled Services, Tourism. MInT role: Primary implementing ministry for startup ecosystem growth and digital economy regulation.`,
      },
      {
        title: 'MInT Startup Designation Guidelines',
        sourceType: 'guidelines',
        content: `MInT Startup Designation Process: Step 1: Submit profile via MInT Innovation Platform. Step 2: Evaluation by MInT Technical Advisory Committee. Step 3: Readiness Score assessment (minimum 60/100 required). Step 4: Formal designation certificate issuance. Designated startups receive priority access to government grants, mentorship, and international trade missions.`,
      },
    ],
  })

  console.log('✓ Knowledge Base seeded')
  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
