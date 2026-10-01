import { NextRequest, NextResponse } from 'next/server'
import { getStripeConfig } from '@/lib/stripe-config'
import { createServerClient } from '@/lib/supabase'
import { GoogleGenAI } from '@google/genai'
import { getTemplate } from '@/lib/templates'
import { salonDefaultServices, salonDefaultStaff } from '@/lib/templates/salon'
import { clinicDefaultServices, clinicDefaultStaff } from '@/lib/templates/clinic'
import { petDefaultServices, petDefaultStaff } from '@/lib/templates/pet'
import { cafeDefaultServices, cafeDefaultStaff } from '@/lib/templates/cafe'
import { mechanicDefaultServices, mechanicDefaultStaff } from '@/lib/templates/mechanic'
import { logEvent, ET } from '@/lib/events'
import type { BusinessType } from '@/types/database'

// Tell Vercel this function can run up to 60 seconds (Hobby plan max)
export const maxDuration = 60

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

async function generateSite(
  business_name: string,
  business_type: BusinessType,
  location: string,
  extra_notes: string,
  owner_email: string,
  stripe_session_id: string,
  stripe_customer_id: string | null,
): Promise<string> {
  const supabase = createServerClient()

  // Idempotency — don't generate twice for the same session
  const { data: existing } = await supabase
    .from('sites')
    .select('slug')
    .eq('stripe_session_id', stripe_session_id)
    .single()

  if (existing) {
    console.log(`[webhook] Already exists for session ${stripe_session_id}: /${existing.slug}`)
    return existing.slug
  }

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
      console.warn(`[webhook] Model ${modelName} unavailable, trying next...`)
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
      if (section.type === 'hero') {
        return { ...section, data: { ...section.data, headline: aiData.headline || section.data.headline, sub: aiData.sub || section.data.sub } }
      }
      if (section.type === 'about') {
        return { ...section, data: { title: aiData.about_title || `About ${business_name}`, body: aiData.about_body || section.data.body } }
      }
      if (section.type === 'testimonials' && aiData.testimonials?.length) {
        return { ...section, data: { items: aiData.testimonials } }
      }
      return section
    }),
  }

  const slug = business_name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Date.now().toString(36)

  const { data: site, error } = await supabase.from('sites').insert({
    slug,
    business_name,
    business_type,
    owner_email: owner_email || null,
    owner_pin: '1234',
    theme_json: themeJson,
    published: true,
    payment_status: 'paid',
    stripe_session_id,
    stripe_customer_id: stripe_customer_id || null,
    paid_at: new Date().toISOString(),
  } as any).select().single()

  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  // Log site creation event (non-blocking)
  logEvent({
    event_type:  ET.SITE_CREATED,
    category:    'site',
    severity:    'info',
    actor_type:  'system',
    actor_id:    'stripe_webhook',
    site_id:     site.id,
    entity_type: 'site',
    entity_id:   site.id,
    summary:     `Site created — ${business_name} (${business_type}) at /${slug}`,
    metadata:    { business_name, business_type, location, slug, stripe_session_id },
  }).catch(() => {})

  const servicesData = aiData.services?.length ? aiData.services : DEFAULT_SERVICES[business_type]
  const staffData = aiData.staff?.length ? aiData.staff : DEFAULT_STAFF[business_type]

  await Promise.all([
    supabase.from('services').insert(
      servicesData.map((s: any) => ({
        site_id: site.id,
        name: s.name,
        price: Number(s.price) || 0,
        duration_minutes: Number(s.duration_minutes || s.duration) || 60,
      }))
    ),
    supabase.from('staff').insert(
      staffData.map((s: any) => ({ site_id: site.id, name: s.name, role: s.role }))
    ),
  ])

  // ── CLIENT RECORD — upsert on payment ────────────────────────
  // When a client pays $150 via /onboard, create or update their client record:
  //   - email is the unique key (from Stripe customer_email / metadata.owner_email)
  //   - subscription_status → active (they paid)
  //   - subscription_plan   → starter (default on first payment)
  //   - onboarding_complete → true
  //   - stripe_customer_id  → linked from Stripe session
  // Then link sites.client_id → the client's id so the site shows up on their profile.
  if (owner_email) {
    try {
      // Derive city from location string (e.g. "Sydney, NSW" → "Sydney")
      const city = location.split(',')[0]?.trim() || null

      // Extract country hint from location (rough heuristic — good enough for segmentation)
      const locationLower = location.toLowerCase()
      const country =
        locationLower.includes('australia') || locationLower.includes(' nsw') || locationLower.includes(' vic') || locationLower.includes(' qld') ? 'AU' :
        locationLower.includes('philippines') || locationLower.includes(' ph') || locationLower.includes('manila') ? 'PH' :
        locationLower.includes('united states') || locationLower.includes(' usa') || locationLower.includes(', ca') || locationLower.includes(', ny') || locationLower.includes(', tx') ? 'US' :
        locationLower.includes('united kingdom') || locationLower.includes(' uk') || locationLower.includes('london') ? 'UK' :
        locationLower.includes('canada') || locationLower.includes(' on') || locationLower.includes(' bc') ? 'CAN' : null

      // Upsert client — create if new, update subscription fields if existing
      const { data: client } = await supabase
        .from('clients')
        .upsert(
          {
            email: owner_email,
            name: business_name, // use business name as fallback — owner can edit later
            subscription_status: 'active',
            subscription_plan: 'starter',
            onboarding_complete: true,
            stripe_customer_id: stripe_customer_id || null,
            source: 'onboard',
            city,
            country,
            // Payment = active subscription, not a trial
            trial_starts_at: null,
            trial_ends_at: null,
          },
          {
            onConflict: 'email',
            ignoreDuplicates: false, // always update subscription fields on payment
          }
        )
        .select('id')
        .single()

      // Link the new site → client
      if (client?.id) {
        await supabase
          .from('sites')
          .update({ client_id: client.id } as any)
          .eq('id', site.id)

        console.log(`[webhook] ✅ Client upserted (${owner_email}) → status=active, site linked`)

        // Log payment + client events (non-blocking)
        logEvent({
          event_type:  ET.PAYMENT_COMPLETED,
          category:    'payment',
          severity:    'info',
          actor_type:  'customer',
          actor_id:    owner_email,
          client_id:   client.id,
          site_id:     site.id,
          entity_type: 'payment',
          entity_id:   stripe_session_id,
          summary:     `Payment completed — $150 setup fee for ${business_name}`,
          metadata:    { stripe_session_id, stripe_customer_id, business_name, business_type },
        }).catch(() => {})

        logEvent({
          event_type:  ET.CLIENT_CREATED,
          category:    'client',
          severity:    'info',
          actor_type:  'system',
          actor_id:    'stripe_webhook',
          client_id:   client.id,
          entity_type: 'client',
          entity_id:   client.id,
          summary:     `Client record created/activated — ${owner_email} (${business_type})`,
          metadata:    { owner_email, business_type, location },
        }).catch(() => {})
      }
    } catch (clientErr: any) {
      // Non-fatal — site is already created, just log the failure
      console.warn('[webhook] Client upsert skipped:', clientErr?.message)
    }
  }

  return slug
}

// ─── WEBHOOK HANDLER ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  // Resolve the correct Stripe client + webhook secret for the active mode
  const { stripeClient, webhookSecret } = await getStripeConfig()

  let event

  if (webhookSecret && sig) {
    try {
      event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('[webhook] Signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const { business_name, business_type, location, owner_email, extra_notes } = session.metadata || {}

    if (!business_name || !business_type || !location) {
      console.error('[webhook] Missing metadata in session:', session.id)
      return NextResponse.json({ received: true })
    }

    console.log(`[webhook] Processing payment for "${business_name}" — session ${session.id}`)

    // Use waitUntil if available (Vercel Edge runtime) — respond to Stripe immediately
    // and continue processing in background. Falls back to awaiting directly.
    const ctx = (req as any)[Symbol.for('waitUntil')]

    const generationPromise = generateSite(
      business_name,
      business_type as BusinessType,
      location,
      extra_notes || '',
      owner_email || '',
      session.id,
      session.customer || null,
    ).then(slug => {
      console.log(`[webhook] ✅ Site generated: /${slug} for "${business_name}"`)
    }).catch((err: any) => {
      console.error(`[webhook] ❌ Generation failed for session ${session.id}:`, err.message)
    })

    // If waitUntil is available, use it — otherwise await directly
    if (typeof ctx === 'function') {
      ctx(generationPromise)
    } else {
      await generationPromise
    }
  }

  return NextResponse.json({ received: true })
}
