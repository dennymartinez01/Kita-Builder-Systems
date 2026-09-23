'use client'

import { useState, useMemo } from 'react'
import { TEMPLATE_REGISTRY, TEMPLATE_CATEGORIES } from '@/lib/templates/registry'
import type { TemplateVariant } from '@/lib/templates/registry'
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
import type { BusinessType } from '@/types/database'
import {
  Search, X, Eye, Code2, Wrench, Users, ExternalLink,
  Zap, ChevronRight, Layers, Check,
} from 'lucide-react'
import Link from 'next/link'

const DEFAULT_SERVICES: Record<BusinessType, any[]> = {
  salon: salonDefaultServices,
  clinic: clinicDefaultServices,
  pet: petDefaultServices,
  cafe: cafeDefaultServices,
  mechanic: mechanicDefaultServices,
}

const DEFAULT_STAFF: Record<BusinessType, any[]> = {
  salon: salonDefaultStaff,
  clinic: clinicDefaultStaff,
  pet: petDefaultStaff,
  cafe: cafeDefaultStaff,
  mechanic: mechanicDefaultStaff,
}

type DetailTab = 'preview' | 'services' | 'staff' | 'json'

export default function TemplatesPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<TemplateVariant | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('preview')

  const filtered = useMemo(() => {
    return TEMPLATE_REGISTRY.filter(t => {
      const matchCat = category === 'all' || t.business_type === category
      const matchSearch = !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [category, search])

  function openDetail(t: TemplateVariant) {
    setSelected(t)
    setDetailTab('preview')
  }

  function closeDetail() {
    setSelected(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="text-purple-400" size={24} />
              Templates
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {TEMPLATE_REGISTRY.length} templates across 5 business types. Click any card to preview.
            </p>
          </div>
          <Link
            href="/admin/generate"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Zap size={14} />
            Use a Template
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 flex-wrap pb-4 border-b border-gray-800">
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {cat.label}
              <span className="ml-1.5 text-xs opacity-60">
                {cat.id === 'all'
                  ? TEMPLATE_REGISTRY.length
                  : TEMPLATE_REGISTRY.filter(t => t.business_type === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Layers size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No templates match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selected?.id === template.id}
                onClick={() => openDetail(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {selected && (
        <TemplateDetail
          template={selected}
          tab={detailTab}
          setTab={setDetailTab}
          onClose={closeDetail}
          services={DEFAULT_SERVICES[selected.business_type]}
          staff={DEFAULT_STAFF[selected.business_type]}
        />
      )}
    </div>
  )
}

// ─── TEMPLATE CARD ────────────────────────────────────────────────
function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: TemplateVariant
  isSelected: boolean
  onClick: () => void
}) {
  const hero = template.template.sections.find(s => s.type === 'hero') as any

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-gray-800 hover:border-gray-600'
        }
        bg-gray-900 hover:bg-gray-800/80
      `}
    >
      {/* Thumbnail */}
      <div
        className="relative h-40 overflow-hidden"
        style={{ background: template.previewBg }}
      >
        {/* Simulated website preview */}
        <div className="absolute inset-0 flex flex-col">
          {/* Mock nav */}
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div className="flex gap-1.5">
              <div className="w-8 h-1.5 rounded-full bg-white/40" />
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            <div className="w-10 h-4 rounded bg-white/20 text-white/60 text-[6px] flex items-center justify-center font-bold">
              BOOK
            </div>
          </div>

          {/* Mock hero content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <div className="w-32 h-2 rounded-full bg-white/80 mb-2" />
            <div className="w-20 h-1.5 rounded-full bg-white/40 mb-3" />
            <div
              className="px-3 py-1 rounded-full text-[7px] font-bold text-white/90"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {hero?.data?.cta || 'Book Now'}
            </div>
          </div>

          {/* Mock services strip */}
          <div className="flex gap-1.5 px-3 pb-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 h-6 rounded bg-white/10 border border-white/10" />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white">
              NEW
            </span>
          )}
          {template.isFree && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/80 text-white">
              FREE
            </span>
          )}
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Eye size={11} />
            Preview
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold text-sm leading-tight">{template.name}</h3>
          <span className="text-gray-600 text-xs shrink-0">{template.label}</span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{template.description}</p>

        {/* Color dots + tags */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[template.colors.primary, template.colors.secondary].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-gray-700"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {template.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-gray-600 text-[10px] px-1.5 py-0.5 rounded bg-gray-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TEMPLATE DETAIL SLIDE-OVER ───────────────────────────────────
function TemplateDetail({
  template,
  tab,
  setTab,
  onClose,
  services,
  staff,
}: {
  template: TemplateVariant
  tab: DetailTab
  setTab: (t: DetailTab) => void
  onClose: () => void
  services: any[]
  staff: any[]
}) {
  const hero = template.template.sections.find(s => s.type === 'hero') as any
  const booking = template.template.sections.find(s => s.type === 'booking_widget') as any
  const testimonials = template.template.sections.find(s => s.type === 'testimonials') as any

  const tabs: { id: DetailTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'json', label: 'JSON', icon: Code2 },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div
          className="relative px-6 py-5 shrink-0"
          style={{ background: template.previewBg }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
                TEMPLATE · {template.label}
              </p>
              <h2 className="text-white text-2xl font-bold">{template.name}</h2>
              <p className="text-white/70 text-sm mt-1">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Color chips */}
          <div className="flex items-center gap-4 mt-4 text-white/70 text-xs">
            <span>Primary: <span className="text-white font-mono">{template.colors.primary}</span></span>
            <span>Accent: <span className="text-white font-mono">{template.colors.secondary}</span></span>
            <span>Font: <span className="text-white font-mono">{template.font}</span></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'preview' && (
            <div className="space-y-5">
              {/* Sections list */}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
                  Sections included
                </p>
                <div className="space-y-2">
                  {template.template.sections.map((section, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                      <span className="text-gray-600 text-xs font-mono w-5 text-right">{i + 1}</span>
                      <span className="text-blue-400 font-mono text-xs w-32">{section.type}</span>
                      <span className="text-gray-500 text-xs">{getSectionDesc(section)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero preview */}
              {hero && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
                    Hero section preview
                  </p>
                  <div
                    className="rounded-xl p-8 text-center"
                    style={{ background: template.previewBg }}
                  >
                    <h3 className="text-white font-bold text-xl">{hero.data.headline}</h3>
                    <p className="text-white/70 text-sm mt-2">{hero.data.sub}</p>
                    <button
                      className="mt-4 px-6 py-2 bg-white text-sm font-bold rounded-full"
                      style={{ color: template.colors.primary }}
                    >
                      {hero.data.cta}
                    </button>
                  </div>
                </div>
              )}

              {/* Booking info */}
              {booking && (
                <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">📅 Booking widget</span>
                  <span className="text-blue-300 text-xs">
                    {booking.data.requires_field !== 'none'
                      ? `Custom field: ${booking.data.requires_field}`
                      : 'No custom field'}
                    {booking.data.deposit_percent > 0 && ` · ${booking.data.deposit_percent}% deposit`}
                  </span>
                </div>
              )}

              {/* Testimonials */}
              {testimonials && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
                    Sample testimonials
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {testimonials.data.items.map((t: any, i: number) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-3">
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <span key={j} className="text-yellow-400 text-xs">★</span>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs italic leading-relaxed">"{t.text}"</p>
                        <p className="text-gray-600 text-xs mt-2">— {t.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'services' && (
            <div>
              <p className="text-gray-400 text-xs mb-4">
                Default services loaded when this template is used. Clients can edit in their dashboard.
              </p>
              <div className="space-y-2">
                {services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-gray-500 text-xs">{s.duration_minutes} min</p>
                    </div>
                    <span
                      className="font-mono font-bold text-sm"
                      style={{ color: template.colors.secondary }}
                    >
                      ${s.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'staff' && (
            <div>
              <p className="text-gray-400 text-xs mb-4">
                Default staff. Replaced by AI-generated names when site is created.
              </p>
              <div className="space-y-2">
                {staff.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-800 rounded-xl px-4 py-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: template.colors.primary }}
                    >
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

          {tab === 'json' && (
            <div>
              <p className="text-gray-400 text-xs mb-3">
                The <span className="font-mono text-blue-300">theme_json</span> stored in Supabase. This is what AI fills in and the renderer reads.
              </p>
              <pre className="text-xs text-green-300 font-mono overflow-x-auto leading-5 bg-gray-950 border border-gray-800 p-4 rounded-xl">
                {JSON.stringify(template.template, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0">
          <Link
            href={`/admin/generate?template=${template.id}&type=${template.business_type}`}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition hover:opacity-90"
            style={{ backgroundColor: template.colors.primary }}
          >
            <Zap size={16} />
            Use This Template
            <ChevronRight size={14} />
          </Link>
          <p className="text-gray-600 text-xs text-center mt-2">
            AI will fill in the content — you just provide the business details
          </p>
        </div>
      </div>
    </>
  )
}

function getSectionDesc(section: any): string {
  switch (section.type) {
    case 'hero': return `"${section.data.headline}"`
    case 'services': return 'Pulls from services table — editable in dashboard'
    case 'staff': return 'Pulls from staff table — editable in dashboard'
    case 'about': return `"${section.data.title}"`
    case 'booking_widget':
      return `Custom field: ${section.data.requires_field} · Deposit: ${section.data.deposit_percent}%`
    case 'testimonials': return `${section.data.items?.length || 0} sample reviews`
    default: return ''
  }
}
