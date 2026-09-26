import type { ReactNode } from 'react'
import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'

// Audit pages use the same dark admin theme.
// A client-facing frontend template is planned for Phase 3 (see backlog).

export default function AuditLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar — matches admin style */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition"
        >
          <ArrowLeft size={12} />
          Admin
        </Link>
        <div className="w-px h-4 bg-gray-800" />
        <div className="flex items-center gap-2">
          <Search size={14} className="text-blue-400" />
          <span className="text-white font-semibold text-sm">Website Audit</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 font-medium">Phase 2</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/audit"
            className="text-gray-500 hover:text-gray-300 text-xs transition"
          >
            All Audits
          </Link>
          <Link
            href="/admin/docs/audit"
            className="text-gray-500 hover:text-gray-300 text-xs transition"
          >
            Docs
          </Link>
        </div>
      </div>

      {/* Page content */}
      <div className="text-white">
        {children}
      </div>
    </div>
  )
}
