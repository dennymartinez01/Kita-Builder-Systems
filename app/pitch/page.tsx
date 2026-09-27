import Link from 'next/link'

// This is your outreach / demo page — the link you send to cold DMs.
// Share it as: yourapp.com/pitch
// It shows what KITA does, who it's for, and links to a live demo site.

const DEMO_SLUG = 'edison-barber-shop-for-men-and-women-mudy5k75' // Update with your best demo slug

const NICHE_EXAMPLES = [
  { icon: '✂️', type: 'Salon / Barbershop', example: 'Booking widget, staff profiles, service pricing' },
  { icon: '🏥', type: 'Clinic / Dental', example: 'Appointment booking, doctor profiles, hours' },
  { icon: '🐾', type: 'Pet Clinic / Grooming', example: 'Pet booking, vet profiles, vaccination services' },
  { icon: '☕', type: 'Cafe / Restaurant', example: 'Table reservations, menu display, opening hours' },
  { icon: '🔧', type: 'Mechanic / Auto Repair', example: 'Service booking, car model field, staff team' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Tell us about your business', desc: 'Just your business name, location, and what you do. Takes 30 seconds.' },
  { step: '2', title: 'AI builds your site', desc: 'Our AI generates your headline, services, staff, and copy — tailored to your location and business type.' },
  { step: '3', title: 'Go live instantly', desc: 'Your site is live with a booking form, email notifications, and an owner dashboard to manage everything.' },
  { step: '4', title: 'Capture leads & grow', desc: 'A contact form catches customers who aren\'t ready to book yet. Every inquiry becomes a trackable lead — yours to follow up and convert.' },
]

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900">KITA Systems</span>
        </div>
        <a
          href={`/${DEMO_SLUG}`}
          target="_blank"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full transition"
        >
          See Live Demo →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="px-5 py-20 sm:py-28 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          ⚡ AI-Powered Website Builder for Local Businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-5">
          Your Business Online<br />
          <span className="text-blue-600">In 10 Seconds.</span>
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
          We build your booking website using AI — complete with your services, team, and a booking form that works 24/7. No templates. No drag-and-drop. Just done.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/${DEMO_SLUG}`}
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition"
          >
            See a Live Demo Site →
          </a>
          <a
            href="https://wa.me/639XXXXXXXXX?text=Hi%20Denny%2C%20I%20saw%20your%20KITA%20website%20builder%20and%20I%27m%20interested%20in%20a%20free%20demo%20for%20my%20business."
            target="_blank"
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl text-sm transition"
          >
            Get a Free Demo Site 💬
          </a>
        </div>
        <p className="text-gray-400 text-xs mt-4">Free for the first 3 businesses. No credit card.</p>
      </section>

      {/* ── LIVE DEMO PREVIEW ── */}
      <section className="px-5 pb-16 max-w-4xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden">
          <div className="bg-gray-200 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center">
              yoursite.com/edison-barber-shop
            </div>
          </div>
          <a href={`/${DEMO_SLUG}`} target="_blank" className="block">
            <div className="bg-[#1A1A2E] px-8 py-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800)', backgroundSize: 'cover' }} />
              <div className="relative">
                <h2 className="text-white font-bold text-2xl sm:text-3xl mb-2">Classic Cuts & Modern Styles in Portland</h2>
                <p className="text-white/70 text-sm mb-5">Experience precision haircuts, beard trims, and hot towel shaves.</p>
                <span className="bg-white text-[#1A1A2E] font-bold px-6 py-2.5 rounded-full text-sm inline-block">Book Now</span>
              </div>
            </div>
            <div className="bg-white p-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-gray-500 text-sm">Live demo — click to explore the full site + booking form</span>
              <span className="text-blue-600 text-sm font-medium">Open →</span>
            </div>
          </a>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Built for Local Service Businesses
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            If your customers book appointments, you need this. No more lost bookings over DMs or missed calls.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NICHE_EXAMPLES.map(n => (
              <div key={n.type} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-3xl mb-3">{n.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{n.type}</h3>
                <p className="text-gray-500 text-sm">{n.example}</p>
              </div>
            ))}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="font-bold mb-1">Tradies & More</h3>
              <p className="text-blue-100 text-sm">Electricians, plumbers, cleaners, gyms, tutors — if you take bookings, we build it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            How It Works
          </h2>
          <div className="space-y-4">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="flex gap-4 items-start bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="px-5 py-16 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Everything Included
          </h2>
          <p className="text-gray-400 mb-10">No hidden fees. No technical knowledge needed.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-10">
            {[
              '✅ AI-generated website copy & design',
              '✅ Online booking form (24/7)',
              '✅ Contact / inquiry form to capture leads',
              '✅ Email notification on every booking & inquiry',
              '✅ Mobile-friendly on all devices',
              '✅ Services & pricing page',
              '✅ Staff / team section',
              '✅ Opening hours display',
              '✅ Owner dashboard with PIN login',
              '✅ Edit your site by chatting with AI',
              '✅ Custom domain support (pro plan)',
              '✅ Smart cross-business promotion network',
            ].map(feature => (
              <div key={feature} className="bg-gray-800 rounded-xl px-4 py-3 text-gray-300 text-sm">
                {feature}
              </div>
            ))}
          </div>

          {/* Pricing — moved to dedicated section above */}
          <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-white/70 text-sm mb-1">Starting from</div>
            <div className="text-white font-black text-4xl mb-1">$150 <span className="text-xl font-normal">setup</span></div>
            <div className="text-white font-bold text-xl">+ $29<span className="text-white/70 font-normal text-base">/month</span></div>
            <p className="text-blue-100 text-sm mt-3 mb-6">Starter plan · Includes hosting, updates, and support. Cancel anytime.</p>
            <a
              href="https://wa.me/639XXXXXXXXX?text=Hi%20Denny%2C%20I%20want%20a%20website%20for%20my%20business."
              target="_blank"
              className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-xl text-sm transition hover:opacity-90 mb-3"
            >
              Get Started — Message Us on WhatsApp
            </a>
            <a
              href="/onboard"
              className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl text-sm transition ml-3"
            >
              Pay & Launch Now — $150 →
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-5 py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            One setup fee. One monthly subscription. No hidden costs. Pick the plan that fits your business today — upgrade anytime.
          </p>

          {/* Setup fee note */}
          <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300 mb-10">
            <span className="text-yellow-400">★</span>
            All plans include a <strong className="text-white">$150 one-time setup fee</strong> — AI generation, site build, and launch.
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              {
                plan: 'Starter',
                price: '$29',
                period: '/month',
                desc: 'Perfect for a single business owner who wants a professional booking site running 24/7.',
                features: [
                  '1 client site',
                  'AI-generated website',
                  'Online booking widget (24/7)',
                  'Owner dashboard — 10 tabs',
                  'AI assistant to edit by chat',
                  'Email notification on every booking',
                  'Cancel / reschedule self-service',
                  'Site analytics (14-day)',
                  'Contact / inquiry form',
                ],
                color: 'border-blue-700',
                badge: 'bg-blue-600',
                highlight: false,
              },
              {
                plan: 'Growth',
                price: '$49',
                period: '/month',
                desc: 'For businesses expanding to multiple locations, or agencies managing a few clients.',
                features: [
                  'Up to 3 client sites',
                  'Everything in Starter',
                  'SMS booking reminders',
                  '2 promotion blasts / month',
                  'Cross-network audience access',
                  'Priority support',
                ],
                color: 'border-green-500',
                badge: 'bg-green-600',
                highlight: true,
              },
              {
                plan: 'Agency',
                price: '$99',
                period: '/month',
                desc: 'For web agencies and freelancers reselling KITA under their own brand.',
                features: [
                  'Up to 10 client sites',
                  'Everything in Growth',
                  'White-label mode (remove KITA branding)',
                  'Custom domain support',
                  '5 promotion blasts / month',
                  'Dedicated onboarding call',
                ],
                color: 'border-purple-700',
                badge: 'bg-purple-600',
                highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.plan}
                className={`relative border-2 rounded-2xl p-6 text-left ${plan.color} ${plan.highlight ? 'bg-gray-800 scale-105 shadow-xl' : 'bg-gray-800/50'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <div className={`inline-block text-xs font-bold text-white px-2 py-0.5 rounded-full mb-3 ${plan.badge}`}>{plan.plan}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-white font-black text-4xl">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-xs mb-5 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 shrink-0 mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Setup fee reminder + CTA */}
          <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <p className="text-white/80 text-sm mb-1">Get started today</p>
            <div className="text-white font-black text-3xl mb-1">$150 <span className="text-xl font-normal">one-time setup</span></div>
            <div className="text-white font-bold text-xl mb-1">+ from <span className="font-black">$29</span><span className="text-white/70 font-normal text-base">/month</span></div>
            <p className="text-blue-100 text-sm mt-2 mb-6">Includes hosting, the booking system, AI assistant, and ongoing updates. Cancel anytime.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/639XXXXXXXXX?text=Hi%20Denny%2C%20I%20want%20a%20website%20for%20my%20business."
                target="_blank"
                className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-xl text-sm transition hover:opacity-90"
              >
                Message Us on WhatsApp
              </a>
              <a
                href="/onboard"
                className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl text-sm transition"
              >
                Pay & Launch Now — $150 →
              </a>
            </div>
          </div>

          <p className="text-gray-600 text-xs mt-6">14-day free trial available · No credit card required to start</p>
        </div>
      </section>

      {/* ── LEADS & PROMOTIONS ── */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              🧠 Built-In Lead Capture + Smart Promotions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Not every customer is ready to book.<br />
              <span className="text-purple-600">Capture them anyway.</span>
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-2xl">
              Every KITA site includes a contact form alongside the booking widget. Customers who want to ask a question first — instead of committing to a booking — can send a message. That inquiry becomes a lead in your dashboard, ready for follow-up.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '📬', title: 'Contact Form', desc: '"Not ready to book? Send us a message." Sits next to the booking widget on every site.' },
                { icon: '📋', title: 'Leads Dashboard', desc: 'See every inquiry in your owner dashboard — name, message, email. One click to convert to a booking.' },
                { icon: '🎯', title: 'Smart Promotions', desc: 'Opted-in leads from across our client network can receive targeted local offers — your business, their neighbourhood.' },
              ].map(card => (
                <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm italic">
              "You had 12 new bookings and 8 inquiries this week. 3 inquiries are still open — follow up now."
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-5 py-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">
          <strong className="text-gray-900">KITA Systems</strong> · From Struggle to Booked. ✊
        </p>
        <p className="text-gray-400 text-xs mt-1">Built in Quezon City · Serving AU, US, UK, PH, CAN</p>
        <Link href="/admin" className="text-gray-300 text-xs mt-3 inline-block hover:text-gray-500 transition">
          Admin Login
        </Link>
      </footer>
    </div>
  )
}
