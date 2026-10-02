import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookingForm from '@/components/BookingForm'
import BookingContactSection from '@/components/BookingContactSection'
import PageTracker from '@/components/PageTracker'
import { getWhiteLabelConfig, getSiteWhiteLabel } from '@/lib/whitelabel'
import type { ThemeJson, Service, Staff, HeroSection, AboutSection, BookingSection, TestimonialsSection } from '@/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params

  const siteRes = await supabase
    .from('sites').select('*').eq('slug', slug).eq('published', true).single()

  if (!siteRes.data) return notFound()

  const site = siteRes.data
  const theme: ThemeJson = site.theme_json

  const [servicesRes, staffRes] = await Promise.all([
    supabase.from('services').select('*').eq('site_id', site.id).order('price'),
    supabase.from('staff').select('*').eq('site_id', site.id),
  ])

  const services: Service[] = servicesRes.data || []
  const staff: Staff[] = staffRes.data || []
  const themeJson = theme as any

  const hero = theme.sections.find(s => s.type === 'hero') as HeroSection | undefined
  const about = theme.sections.find(s => s.type === 'about') as AboutSection | undefined
  const booking = theme.sections.find(s => s.type === 'booking_widget') as BookingSection | undefined
  const testimonials = theme.sections.find(s => s.type === 'testimonials') as TestimonialsSection | undefined
  const gallerySection = theme.sections.find(s => s.type === 'gallery') as any
  const galleryImages: string[] = gallerySection?.data?.images || []

  const primary = theme.theme?.primary || '#1A1A1A'
  const bg = theme.theme?.bg || '#FFFFFF'
  const currency = (site as any).currency || 'USD'
  const siteTimezone = (site as any).timezone || 'UTC'
  const currencySymbol = (() => {
    const map: Record<string, string> = { USD: '$', AUD: '$', GBP: '£', CAD: '$', NZD: '$', PHP: '₱', EUR: '€', SGD: '$', MYR: 'RM', INR: '₹' }
    return map[currency] || '$'
  })()

  // Business hours from theme_json if set
  const hours = themeJson?.business_hours as Record<string, { open: string; close: string; closed: boolean }> | undefined

  // White-label config
  const wl = getWhiteLabelConfig()
  const siteWl = getSiteWhiteLabel(themeJson)

  // Determine footer brand text
  const footerBrand = siteWl.hide_footer_brand
    ? null
    : siteWl.custom_footer
      ? siteWl.custom_footer
      : wl.enabled
        ? `${wl.agencyName}${wl.agencyTagline ? ' · ' + wl.agencyTagline : ''}`
        : null // null = use default KITA branding

  const footerUrl = wl.enabled ? wl.agencyUrl : 'https://kita-builder-systems.vercel.app'

  return (
    <div style={{ backgroundColor: bg, fontFamily: `${theme.theme?.font || 'Inter'}, sans-serif` }} className="overflow-x-hidden">
      {/* Fire analytics tracking — non-blocking, client-side */}
      <PageTracker siteId={site.id} path={`/${slug}`} />

      {/* ── MOBILE NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ backgroundColor: primary }}>
        <span className="text-white font-bold text-base truncate max-w-[60%]">{site.business_name}</span>
        <a
          href="#book"
          className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition hover:opacity-90"
          style={{ backgroundColor: 'white', color: primary }}
        >
          Book Now
        </a>
      </nav>

      {/* ── HERO ── */}
      {hero && (
        <section className="relative px-5 py-16 sm:py-24 text-center" style={{ backgroundColor: primary }}>
          {hero.data.image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${hero.data.image_url})` }}
            />
          )}
          <div className="relative max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {hero.data.headline}
            </h1>
            <p className="text-white/75 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
              {hero.data.sub}
            </p>
            <a
              href="#book"
              className="inline-block mt-8 px-8 py-4 rounded-full font-bold text-sm transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'white', color: primary }}
            >
              {hero.data.cta}
            </a>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {services.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary }}>
              Our Services
            </h2>
            {/* Single column on mobile, 2 on sm, 3 on lg */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{service.name}</h3>
                    <span className="text-xl font-bold shrink-0" style={{ color: primary }}>
                      {currencySymbol}{service.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{service.duration_minutes} min</p>
                  <a
                    href="#book"
                    className="mt-4 block text-center text-sm font-semibold py-2.5 rounded-xl transition hover:opacity-85 active:scale-95"
                    style={{ backgroundColor: primary, color: 'white' }}
                  >
                    Book Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      {about && (
        <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: primary + '12' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: primary }}>
              {about.data.title}
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{about.data.body}</p>
          </div>
        </section>
      )}

      {/* ── HOURS ── */}
      {hours && (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: primary }}>
              Opening Hours
            </h2>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {Object.entries(hours).map(([day, h], i) => (
                <div key={day} className={`flex items-center justify-between px-5 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="font-medium text-gray-900 w-28">{day}</span>
                  {h.closed
                    ? <span className="text-gray-400">Closed</span>
                    : <span className="text-gray-700">{h.open} – {h.close}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STAFF ── */}
      {staff.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary }}>
              Meet Our Team
            </h2>
            {/* Horizontal scroll on mobile if many staff */}
            <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
              {staff.map(member => (
                <div key={member.id} className="text-center w-28 sm:w-36">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto flex items-center justify-center text-xl sm:text-2xl font-bold text-white mb-3"
                    style={{ backgroundColor: primary }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {galleryImages.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary }}>
              Our Work
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Gallery photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOOKING + ENQUIRY ── */}
      {services.length > 0 && (
        <section id="book" className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-lg mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
            <BookingContactSection
              siteId={site.id}
              services={services}
              staff={staff}
              requiresField={booking?.data.requires_field || 'none'}
              primaryColor={primary}
              depositPercent={booking?.data.deposit_percent || 0}
              title={booking?.data.title || 'Book an Appointment'}
              notesLabel={booking?.data.notes_label || 'Notes'}
              notesPlaceholder={booking?.data.notes_placeholder || 'Anything we should know...'}
              notesRequired={booking?.data.notes_required || false}
              currencySymbol={currencySymbol}
              siteTimezone={siteTimezone}
              showContactTab={true}
            />
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testimonials && testimonials.data.items.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: primary }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-white mb-8">
              What Our Customers Say
            </h2>
            {/* Stack on mobile, grid on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {testimonials.data.items.map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-5">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-white/85 text-sm italic leading-relaxed">"{t.text}"</p>
                  <p className="text-white/50 text-xs mt-3">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs">
          {site.business_name}
          {footerBrand !== null && (
            <>
              {' · '}
              <a
                href={footerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:opacity-80"
                style={{ color: primary }}
              >
                {footerBrand || (
                  <>Powered by <span className="font-semibold">KITA Systems</span></>
                )}
              </a>
            </>
          )}
        </p>
        <a
          href={`/${slug}/dashboard`}
          className="text-gray-300 text-xs hover:text-gray-500 mt-1 inline-block transition"
        >
          Owner Login
        </a>
      </footer>
    </div>
  )
}
