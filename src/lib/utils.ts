// MInT Platform — Utility Functions

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { StartupStage, StartupStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ETB'): string {
  if (currency === 'ETB') {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getStageLabel(stage: StartupStage): string {
  const labels: Record<StartupStage, string> = {
    IDEA: 'Idea',
    PROBLEM_VALIDATED: 'Problem Validated',
    PROTOTYPE: 'Prototype',
    MVP: 'MVP',
    EARLY_TRACTION: 'Early Traction',
    GROWTH: 'Growth',
    INVESTMENT_READY: 'Investment Ready',
  }
  return labels[stage] || stage
}

export function getNextStage(stage: StartupStage): StartupStage | null {
  const stages: StartupStage[] = [
    'IDEA', 'PROBLEM_VALIDATED', 'PROTOTYPE', 'MVP', 
    'EARLY_TRACTION', 'GROWTH', 'INVESTMENT_READY'
  ]
  const idx = stages.indexOf(stage)
  return idx < stages.length - 1 ? stages[idx + 1] : null
}

export function getNextMilestone(stage: StartupStage): string {
  const milestones: Record<StartupStage, string> = {
    IDEA: 'Conduct 20+ problem interviews with target users',
    PROBLEM_VALIDATED: 'Build a working prototype in 4-8 weeks',
    PROTOTYPE: 'Launch MVP and acquire first 50 users',
    MVP: 'Reach 500 validated active users',
    EARLY_TRACTION: 'Achieve 20% month-over-month growth for 3 months',
    GROWTH: 'Build investor-grade financial model and prepare pitch deck',
    INVESTMENT_READY: 'Close seed/Series A funding round',
  }
  return milestones[stage]
}

export function getStatusColor(status: StartupStatus): string {
  const colors: Record<StartupStatus, string> = {
    DRAFT: 'badge-gray',
    PENDING_REVIEW: 'badge-gold',
    APPROVED: 'badge-green',
    REJECTED: 'badge-red',
    FEATURED: 'badge-blue',
  }
  return colors[status]
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#4ADE80'
  if (score >= 60) return '#FBBF24'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Developing'
  return 'Early Stage'
}

export function getMatchColor(matchScore: number): string {
  if (matchScore >= 85) return '#4ADE80'
  if (matchScore >= 70) return '#FBBF24'
  if (matchScore >= 50) return '#F97316'
  return '#9CA3AF'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
}

export const SECTOR_COLORS: Record<string, string> = {
  Agriculture: '#4ADE80',
  FinTech: '#60A5FA',
  HealthTech: '#F87171',
  EdTech: '#A78BFA',
  'Climate Tech': '#34D399',
  Logistics: '#FBBF24',
  'AI & Machine Learning': '#818CF8',
  Cybersecurity: '#F472B6',
  Manufacturing: '#FB923C',
  Tourism: '#2DD4BF',
  Energy: '#FDE047',
  'Digital Services': '#38BDF8',
  'E-Commerce': '#E879F9',
  Other: '#9CA3AF',
}

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] || '#9CA3AF'
}
