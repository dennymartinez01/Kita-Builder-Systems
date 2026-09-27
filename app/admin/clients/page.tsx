'use client'

import Link from 'next/link'
import { Users, AlertCircle, BookOpen } from 'lucide-react'

// CLIENT MANAGEMENT — Phase 9
// Full build plan documented at /admin/docs → "Client Management System (Phase 9)"
// This page will be built next after Phase 7 (Admin Power Tools)

export default function ClientsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-blue-400" size={24} />
          Client Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Track who your clients are, their subscriptions, businesses, and revenue.
        </p>
      </div>

      <div className="bg-orange-950/30 border border-orange-800/50 rounded-2xl p-8 text-center">
        <AlertCircle size={40} className="text-orange-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Phase 9 — Coming Soon</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Client Management System is planned and fully documented. It includes client profiles, subscription plans, multi-site management, and revenue per client.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-6 text-left max-w-xl mx-auto">
          {[
            { icon: '👤', label: 'Client profiles', desc: 'Name, email, country, phone' },
            { icon: '💳', label: 'Subscription tracking', desc: 'Plan, status, billing history' },
            { icon: '🏢', label: 'Multi-site management', desc: 'One client, many businesses' },
            { icon: '💰', label: 'Revenue per client', desc: 'MRR contribution + lifetime value' },
            { icon: '📊', label: 'Source tracking', desc: 'Outreach / referral / organic' },
            { icon: '📝', label: 'Internal notes', desc: 'Context about each relationship' },
          ].map(item => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="text-white text-xs font-semibold">{item.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/admin/docs"
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
          onClick={() => {
            // Will open to the client-management section
            sessionStorage.setItem('docs_open', 'client-management')
          }}
        >
          <BookOpen size={14} />
          View Full Build Plan in Docs →
        </Link>
      </div>

      {/* Summary of what will be here */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Build Order (Phase 9)</p>
        <div className="space-y-2">
          {[
            { step: '1', task: 'Create clients table in Supabase + add client_id to sites', effort: '5 min SQL', done: false },
            { step: '2', task: '/admin/clients — searchable client list with filters', effort: '2-3 hours', done: false },
            { step: '3', task: '/admin/clients/[id] — full profile + sites + revenue', effort: '2-3 hours', done: false },
            { step: '4', task: '/admin/clients/new — manual client creation', effort: '1 hour', done: false },
            { step: '5', task: 'Auto-create client on /onboard payment', effort: '30 min', done: false },
            { step: '6', task: 'Client column in /admin/sites + revenue tab', effort: '1 hour', done: false },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 w-5 text-right shrink-0 font-mono">{item.step}.</span>
              <span className="text-gray-300 flex-1">{item.task}</span>
              <span className="text-gray-600 text-xs shrink-0">{item.effort}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
