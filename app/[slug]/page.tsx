import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookingForm from '@/components/BookingForm'
import type { ThemeJson, Service, Staff, HeroSection, AboutSection, BookingSection, TestimonialsSection } from '@/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params

  // Fetch all site data in parallel
  const [siteRes] = await Promise.all([
    supabase.from('sites').select('*').eq('slug', slug).eq('published', true).single(),
  ])

  if (!siteRes.data) return notFound()

  const site = siteRes.data
  const theme: ThemeJson = site.theme_json

  const [servicesRes, staffRes] = await Promise.all([
    supabase.from('services').select('*').eq('site_id', site.id).order('price'),
    supabase.from('staff').select('*').eq('site_id', site.id),
  ])

  const services: Service[] = servicesRes.data || []
  const staff: Staff[] = staffRes.data || []

  const hero = theme.sections.find(s => s.type === 'hero') as HeroSection | undefined
  const about = theme.sections.find(s => s.type === 'about') as AboutSection | undefined
  const booking = theme.sections.find(s => s.type === 'booking_widget') as BookingSection | undefined
  const testimonials = theme.sections.find(s => s.type === 'testimonials') as TestimonialsSection | undefined

  const primary = theme.theme?.primary || '#1A1A1A'
  const secondary = theme.theme?.secondary || '#3B82F6'
  const bg = theme.theme?.bg || '#FFFFFF'

  return (
    <div style={{ backgroundColor: bg, fontFamily: `${theme.theme?.font || 'Inter'}, sans-serif` }}>
      {/* HERO SECTION */}
      {hero && (
        <section
          className="relative px-6 py-20 text-center"
          style={{ backgroundColor: primary }}
        >
          {hero.data.image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${hero.data.image_url})` }}
            />
          )}
          <div className="relative max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {hero.data.headline}
            </h1>
            <p className="text-white/75 text-lg mt-4 max-w-xl mx-auto">
              {hero.data.sub}
            </p>
            <a
              href="#book"
              className="inline-block mt-8 px-8 py-4 rounded-full font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: 'white', color: primary }}
            >
              {hero.data.cta}
            </a>
          </div>
        </section>
      )}

      {/* SERVICES SECTION */}
      {services.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: primary }}>
              Our Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.duration_minutes} min</p>
                  <p
                    className="text-2xl font-bold mt-3"
                    style={{ color: primary }}
                  >
                    ${service.price}
                  </p>
                  <a
                    href="#book"
                    className="mt-4 block text-center text-sm font-semibold py-2.5 rounded-xl transition hover:opacity-85"
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

      {/* ABOUT SECTION */}
      {about && (
        <section className="py-16 px-6" style={{ backgroundColor: primary + '10' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: primary }}>
              {about.data.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">{about.data.body}</p>
          </div>
        </section>
      )}

      {/* STAFF SECTION */}
      {staff.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: primary }}>
              Meet Our Team
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {staff.map(member => (
                <div key={member.id} className="text-center w-36">
                  <div
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3"
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

      {/* BOOKING SECTION */}
      {services.length > 0 && (
        <section id="book" className="py-16 px-6 bg-gray-50">
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8">
            <BookingForm
              siteId={site.id}
              services={services}
              requiresField={booking?.data.requires_field || 'none'}
              primaryColor={primary}
              depositPercent={booking?.data.deposit_percent || 0}
              title={booking?.data.title || 'Book an Appointment'}
            />
          </div>
        </section>
      )}

      {/* TESTIMONIALS SECTION */}
      {testimonials && testimonials.data.items.length > 0 && (
        <section className="py-16 px-6" style={{ backgroundColor: primary }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-white mb-10">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.data.items.map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-white/80 text-sm italic leading-relaxed">"{t.text}"</p>
                  <p className="text-white/50 text-xs mt-3">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs">
          {site.business_name} · Powered by{' '}
          <span className="font-semibold" style={{ color: primary }}>KITA Systems</span>
        </p>
        <a
          href={`/${slug}/dashboard`}
          className="text-gray-300 text-xs hover:text-gray-400 mt-1 inline-block"
        >
          Owner Login
        </a>
      </footer>
    </div>
  )
}
