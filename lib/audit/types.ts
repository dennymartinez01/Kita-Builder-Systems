// ─── AUDIT MODULE TYPES ───────────────────────────────────────────
// Shared across all analyzers and API routes

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface AuditIssue {
  category: 'performance' | 'seo' | 'security' | 'accessibility' | 'tech' | 'mobile'
  severity: IssueSeverity
  title: string
  description: string
  recommendation: string
  element?: string   // the HTML element or URL that caused the issue
}

export interface AnalyzerResult {
  score: number           // 0-100
  issues: AuditIssue[]
  data?: Record<string, any>  // raw data specific to the analyzer
}

export interface AuditScores {
  performance: number
  seo: number
  security: number
  accessibility: number
  tech: number
  overall: number
}

export interface AuditRecord {
  id: string
  url: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  scores: AuditScores
  raw_data: Record<string, any>
  issues: AuditIssue[]
  created_at: string
}
