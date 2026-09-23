'use client'

import { useState } from 'react'
import { TEMPLATES, BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS } from '@/lib/templates'
import {
  salonDefaultServices, salonDefaultStaff,
} from '@/lib/templates/salon'
import {
  clinicDefaultServices, clinicDefaultStaff,
} from '@/lib/templates/clinic'
import {
  petDefaultServices, petDefaultStaff,
} from '@/lib/templates/pet'
import {
  cafeDefaultServices, cafeDefaultStaff,
} from '@/lib/templates/cafe'
import {
  mechanicDefaultServices, mechanicDefaultStaff,
} from '@/lib/templates/mechanic'
import type { BusinessType, ThemeJson } from '@/types/database'
import { Eye, Code2, Palette, Users, Wrench } from 'lucide-react'

const DEFAULT_SERVICES = {
  salon: salonDefaultServices,
  clinic: clinicDefaultServices,
  pet: petDefaultServices,
  cafe: cafeDefaultServices,
  mechanic: mechanicDefaultServices,
}

const DEFAULT_STAFF = {
  salon: salonDefaultStaff,
  clinic: clinicDefaultStaff,
  pet: petDefaultStaff,
  cafe: cafeDefaultStaff,
  mechanic: mechanicDefaultStaff,
}

const THEME_PREVIEWS: Record<BusinessType, string> = {
  salon: 'from-[#1A1A2E] to-[#E94560]',
  clinic: 'from-[#0369A1] to-[#0EA5E9]',
  pet: 'from-[#15803D] to-[#4ADE80]',
  cafe: 'from-[#92400E] to-[#F59E0B]',
  mechanic: 'from-[#1C1C1C] to-[#EF4444]',
}

type TabKey = 'preview' | 'services' | 'staff' | 'json'

export default function TemplatesPage() {
  const [selected, setSelected] = useState<BusinessType>('salon')
  const [activeTab, setActiveTab] = useState<TabKey>('preview')

  const template = TEMPLATES[selected]
  const services = DEFAULT_SERVICES[selected]
  const staff = DEFAULT_STAFF[selected]

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'services', label: 'Default Services', icon: Wrench },
    { id: 'staff', label: 'Default Staff', icon: Users },
    { id: 'json', label: 'JSON Schema', icon: Code2 },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Palette className="text-purple-400" size={24} />
          Template Library
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          5 base templates — one for each target market. Each generates a full booking site with default services, staff, and copy.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Category list */}
        <div className="w-56 shrink-0">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Business Type</p>
          <div className="space-y-1">
            {(Object.keys(TEMPLATES) as BusinessType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`
                  w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition
                  ${selected === type
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }
                `}
              >
                <span className="text-xl w-6">{BUSINESS_TYPE_ICONS[type]}</span>
                <span className="font-medium text-xs leading-tight">{BUSINESS_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template detail */}
        <div className="flex-1 min-w-0">
          {/* Color swatch header */}
          <div className={`rounded-xl p-6 bg-gradient-to-r ${THEME_PREVIEWS[selected]} mb-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Template</div>
                <h2 className="text-white text-2xl font-bold">{BUSINESS_TYPE_ICONS[selected]} {BUSINESS_TYPE_LABELS[selected]}</h2>
              </div>
              <div className="text-right text-white/70 text-xs space-y-1">
                <div>Primary: <span className="font-mono text-white">{template.theme.primary}</span></div>
                <div>Accent: <span className="font-mono text-white">{template.theme.secondary}</span></div>
                <div>Font: <span className="font-mono text-white">{template.theme.font}</span></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-900 p-1 rounded-xl">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition
                    ${activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}
                  `}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {activeTab === 'preview' && (
              <TemplatePreview template={template} />
            )}

            {activeTab === 'services' && (
              <div>
                <p className="text-gray-400 text-xs mb-4">
                  These are the default services pre-loaded when this template is generated. 
                  Clients can edit them in their dashboard.
                </p>
                <div className="space-y-2">
                  {services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                      <div>
                        <span className="text-white text-sm font-medium">{s.name}</span>
                        <span className="text-gray-500 text-xs ml-3">{s.duration_minutes} min</span>
                      </div>
                      <span className="text-green-400 font-mono text-sm font-bold">${s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <p className="text-gray-400 text-xs mb-4">
                  Default staff members. Replaced by AI-generated names when the site is created.
                </p>
                <div className="space-y-2">
                  {staff.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-800 rounded-lg px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.name}</p>
                        <p className="text-gray-500 text-xs">{s.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'json' && (
              <div>
                <p className="text-gray-400 text-xs mb-3">
                  Raw <span className="font-mono text-blue-300">theme_json</span> stored in Supabase. This is what the AI generates and what the renderer reads.
                </p>
                <pre className="text-xs text-green-300 font-mono overflow-x-auto leading-5 bg-gray-950 p-4 rounded-lg">
                  {JSON.stringify(template, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplatePreview({ template }: { template: ThemeJson }) {
  const hero = template.sections.find(s => s.type === 'hero') as any
  const about = template.sections.find(s => s.type === 'about') as any
  const booking = template.sections.find(s => s.type === 'booking_widget') as any
  const testimonials = template.sections.find(s => s.type === 'testimonials') as any

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-xs mb-3">
        Live preview of sections this template includes. Actual content is replaced by AI on generation.
      </p>

      {/* Sections list */}
      <div className="space-y-2">
        {template.sections.map((section, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
            <span className="text-gray-600 text-xs font-mono w-4">{i + 1}</span>
            <span className="text-blue-400 font-mono text-xs w-32">{section.type}</span>
            <span className="text-gray-400 text-xs">
              {getSectionDescription(section)}
            </span>
          </div>
        ))}
      </div>

      {/* Hero preview */}
      {hero && (
        <div className="mt-4">
          <p className="text-gray-600 text-xs mb-2 uppercase tracking-wider">Hero Section Preview</p>
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: template.theme.primary }}
          >
            <h3 className="text-white font-bold text-xl">{hero.data.headline}</h3>
            <p className="text-white/70 text-sm mt-2">{hero.data.sub}</p>
            <button
              className="mt-4 px-6 py-2 bg-white text-sm font-bold rounded-full"
              style={{ color: template.theme.primary }}
            >
              {hero.data.cta}
            </button>
          </div>
        </div>
      )}

      {/* Testimonials preview */}
      {testimonials && (
        <div className="mt-4">
          <p className="text-gray-600 text-xs mb-2 uppercase tracking-wider">Sample Testimonials</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {testimonials.data.items.map((t: any, i: number) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs italic">"{t.text}"</p>
                <p className="text-gray-600 text-xs mt-2">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking widget info */}
      {booking && (
        <div className="mt-2 bg-gray-800 rounded-lg px-4 py-3 text-xs text-gray-400 flex items-center justify-between">
          <span>📅 Booking widget</span>
          <span className="text-blue-300">
            {booking.data.requires_field !== 'none'
              ? `Custom field: ${booking.data.requires_field}`
              : 'No custom field required'}
          </span>
        </div>
      )}
    </div>
  )
}

function getSectionDescription(section: any): string {
  switch (section.type) {
    case 'hero': return `"${section.data.headline}"`
    case 'services': return 'Pulls from services table — editable in dashboard'
    case 'staff': return 'Pulls from staff table — editable in dashboard'
    case 'about': return `"${section.data.title}"`
    case 'booking_widget':
      return `Custom field: ${section.data.requires_field} · Deposit: ${section.data.deposit_percent}%`
    case 'testimonials': return `${section.data.items.length} sample reviews`
    case 'gallery': return `${section.data.images?.length || 0} images`
    default: return ''
  }
}
