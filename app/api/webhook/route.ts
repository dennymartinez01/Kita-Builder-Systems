import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai'
import { getTemplate } from '@/lib/templates'
import { salonDefaultServices, salonDefaultStaff } from '@/lib/templates/salon'
import { clinicDefaultServices, clinicDefaultStaff } from '@/lib/templates/clinic'
import { petDefaultServices, petDefaultStaff } from '@/lib/templates/pet'
import { cafeDefaultServices, cafeDefaultStaff } from '@/lib/templates/cafe'
import { mechanicDefaultServices, mechanicDefaultStaff } from '@/lib/templates/mechanic'
import type { BusinessType } from '@/types/database'

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

// ─── AI SITE GENERATION (reused from /api/generate) ──────────────
async function generateSite(
  business_name: string,
  business_type: BusinessType,
  location: string,
  extra_notes: string,
  owner_email: string,
  stripe_session_id: string,
  stripe_customer_id: string | null,
): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  const baseTemplate = getTemplate(business_type)

  const prompt = `You are a professional website copywriter for local service businesses.
Business: "${business_name}", Type: ${business_type}, Location: ${location}
${extra_notes ? `Context: ${extra_notes}` : ''}
Return ONLY valid JSON:
{
  "headline": "compelling hero headline max 8 words",
  "sub": "subtitle max 15 words",
  "about_title": "About ${business_name}",
  "about_body": "2-3 sentence about paragraph",
  "services": [{"name": "service", "price": 95, "duration_minutes": 45}],
  "staff": [{"name": "First Last", "role": "title"}],
  "testimonials": [{"name": "Name", "text": "review 10-15 words", "rating": 5}]
}
Use realistic ${location} pricing. 3-5 services, 2-3 staff, 3 testimonials.`

  const MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']
  let response = null

  for (const modelName of MODELS) {
    try {
      response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.7 },
      })
      break
    } catch (err: any) {
      const msg = err.message || ''
      if (!msg.includes('503') && !msg.includes('NOT_FOUND') && !msg.includes('unavailable')) throw err
    }
  }

  if (!response) throw new Error('All Gemini models unavailable')

  const jsonText = (response.text ?? '')
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  const aiData = JSON.parse(jsonText)

  const themeJson = {
    ...baseTemplate,
    business_name,
    sections: baseTemplate.sections.map((section: any) => {
      if (section.type === 'hero') return { ...section, data: { ...section.data, headline: aiData.headline || section.data.headline, sub: aiData.sub || section.data.sub } }
      if (section.type === 'about') return { ...section, data: { title: aiData.about_title || `About ${business_name}`, body: aiData.about_body || section.data.body } }
      if (section.type === 'testimonials' && aiData.testimonials?.length) return { ...section, data: { items: aiData.testimonials } }
      return section
    }),
  }

  const slug = business_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() + '-' + Date.now().toString(36)

  const supabase = createServerClient()

  const { data: site, error } = await supabase.from('sites').insert({
    slug,
    business_name,
    business_type,
    owner_email,
    owner_pin: '1234',
    theme_json: themeJson,
    published: true,
    payment_status: 'paid',
    stripe_session_id,
    stripe_customer_id: stripe_customer_id || null,
    paid_at: new Date().toISOString(),
  } as any).select().single()

  if (error) throw new Error(`Supabase error: ${error.message}`)

  const servicesData = aiData.services?.length ? aiData.services : DEFAULT_SERVICES[business_type]
  const staffData = aiData.staff?.length ? aiData.staff : DEFAULT_STAFF[business_type]

  await supabase.from('services').insert(
    servicesData.map((s: any) => ({ site_id: site.id, name: s.name, price: Number(s.price) || 0, duration_minutes: Number(s.duration_minutes || s.duration) || 60 }))
  )
  await supabase.from('staff').insert(
    staffData.map((s: any) => ({ site_id: site.id, name: s.name, role: s.role }))
  )

  return slug
}

// ─── WEBHOOK HANDLER ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  // Verify webhook signature if secret is configured
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('[webhook] Signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // No webhook secret yet (local dev) — parse directly
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const {
      business_name,
      business_type,
      location,
      owner_email,
      extra_notes,
    } = session.metadata || {}

    if (!business_name || !business_type || !location) {
      console.error('[webhook] Missing metadata in session:', session.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      const slug = await generateSite(
        business_name,
        business_type as BusinessType,
        location,
        extra_notes || '',
        owner_email || '',
        session.id,
        session.customer || null,
      )

      console.log(`[webhook] Site generated: /${slug} for ${business_name}`)
    } catch (err: any) {
      console.error('[webhook] Site generation failed:', err.message)
      // Don't return error — Stripe would retry. Log and move on.
    }
  }

  return NextResponse.json({ received: true })
}
