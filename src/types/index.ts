export type Role = 'STARTUP' | 'MINT_MENTOR' | 'INVESTOR' | 'MINT_ADMIN'
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'
export type StartupStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FEATURED'
export type StartupStage = 'IDEA' | 'PROBLEM_VALIDATED' | 'PROTOTYPE' | 'MVP' | 'EARLY_TRACTION' | 'GROWTH' | 'INVESTMENT_READY'
export type ReviewStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type InterestStatus = 'EXPRESSED' | 'ACKNOWLEDGED' | 'IN_DISCUSSION' | 'DECLINED' | 'CLOSED'

export interface User {
  id: string
  email: string
  role: Role
  status: AccountStatus
  emailVerified: boolean
  firstName: string
  lastName: string
  avatarUrl?: string | null
  createdAt: string
}

export interface TeamMember {
  id: string
  startupId: string
  name: string
  role: string
  isFounder: boolean
  bio?: string | null
  linkedin?: string | null
  email?: string | null
}

export interface StartupDocument {
  id: string
  startupId: string
  name: string
  fileType: string
  fileUrl: string
  fileSizeBytes: number
  mimeType: string
  isPublic: boolean
  uploadedAt: string
}

export interface StartupScore {
  id: string
  startupId: string
  problemClarity: number
  innovationScore: number
  marketValidation: number
  businessModelScore: number
  teamScore: number
  mentorEngagement: number
  overallScore: number
  aiInsightsJson?: string | null
  aiInsights?: {
    strengths?: string[]
    weaknesses?: string[]
    recommendations?: string[]
  }
  computedAt: string
}

export interface StartupProfile {
  id: string
  userId: string
  name: string
  tagline?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  sector: string
  stage: StartupStage
  location: string
  foundedYear?: number | null
  website?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  problemStatement: string
  problemSignificance?: string | null
  targetAudience?: string | null
  solutionDescription?: string | null
  uniqueValueProp?: string | null
  marketSize?: string | null
  competitorAnalysis?: string | null
  businessModel?: string | null
  revenueModel?: string | null
  currentTraction?: string | null
  userCount?: number | null
  keyMetrics?: string | null
  fundingRequired?: number | null
  fundingCurrency: string
  fundingUse?: string | null
  previousFunding?: string | null
  mentorshipNeeds?: string | null
  partnershipNeeds?: string | null
  technologyNeeds?: string | null
  governmentSupport?: string | null
  status: StartupStatus
  readinessScore?: number | null
  submittedAt?: string | null
  approvedAt?: string | null
  featuredAt?: string | null
  createdAt: string
  updatedAt: string
  teamMembers?: TeamMember[]
  documents?: StartupDocument[]
  mentorReviews?: any[]
  mentorQuestions?: any[]
  investmentInterests?: any[]
  startupScores?: StartupScore[]
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  entityType?: string | null
  entityId?: string | null
  startupId?: string | null
  isRead: boolean
  createdAt: string
}
