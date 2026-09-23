import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@/lib/supabase'
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

export async function POST(req: NextRequest) {
  try {
    const { business_name, business_type, location, owner_email, extra_notes } = await req.json()

    if (!business_name || !business_type || !location) {
      return NextResponse.json(
        { error: 'business_name, business_type, and location are required.' },
        { status: 400 }
      )
    }

    // Init Gemini with new @google/genai SDK (supports AQ. auth keys)
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    const baseTemplate = getTemplate(business_type as BusinessType)

    const prompt = `You are a professional website copywriter for local service businesses.

Business: "${business_name}"
Type: ${business_type}
Location: ${location}
${extra_notes ? `Additional context: ${extra_notes}` : ''}

Generate website copy and business details with realistic local pricing for ${location}.
Return ONLY a valid JSON object with this exact structure:
{
  "headline": "compelling hero headline max 8 words",
  "sub": "supporting subtitle max 15 words",
  "about_title": "About ${business_name}",
  "about_body": "2-3 sentences about this business type in ${location}",
  "services": [
    {"name": "service name", "price": 95, "duration_minutes": 45}
  ],
  "staff": [
    {"name": "First Last", "role": "job title"}
  ],
  "testimonials": [
    {"name": "Customer Name", "text": "short genuine review 10-15 words", "rating": 5}
  ]
}

Requirements:
- 3-5 services with realistic ${location} pricing for ${business_type}
- 2-3 staff with appropriate titles for a ${business_type}
- 3 testimonials with realistic local names for ${location}
- Headline must be punchy and specific to ${business_type}
- For mechanic: oil change, brakes, full service
- For salon: haircut, color, styling services
- For clinic: consultation, checkup, treatment
- For pet: vet visit, grooming, vaccination  
- For cafe: table sizes (2, 4, 6 people)`

    // Try primary model, fall back if unavailable
    const MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']
    let response = null
    let lastError = ''

    for (const modelName of MODELS) {
      try {
        response = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        })
        break // success — stop trying
      } catch (err: any) {
        lastError = err.message || ''
        // Only retry on 503 (overloaded) or 404 (model not found) — not on auth errors
        if (!lastError.includes('503') && !lastError.includes('NOT_FOUND') && !lastError.includes('unavailable')) {
          throw err
        }
        console.warn(`[generate] Model ${modelName} unavailable, trying next...`)
      }
    }

    if (!response) throw new Error(`All Gemini models unavailable. Last error: ${lastError}`)

    const rawText = response.text ?? ''

    // Strip any accidental markdown fences
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const aiData = JSON.parse(jsonText)

    // Merge AI copy into base template structure
    const themeJson = {
      ...baseTemplate,
      business_name,
      sections: baseTemplate.sections.map(section => {
        if (section.type === 'hero') {
          return {
            ...section,
            data: {
              ...section.data,
              headline: aiData.headline || section.data.headline,
              sub: aiData.sub || section.data.sub,
            },
          }
        }
        if (section.type === 'about') {
          return {
            ...section,
            data: {
              title: aiData.about_title || `About ${business_name}`,
              body: aiData.about_body || section.data.body,
            },
          }
        }
        if (section.type === 'testimonials' && aiData.testimonials?.length) {
          return { ...section, data: { items: aiData.testimonials } }
        }
        return section
      }),
    }

    // Build URL-safe slug
    const slug = business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Date.now().toString(36)

    // Save to Supabase
    const supabase = createServerClient()

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        slug,
        business_name,
        business_type: business_type as BusinessType,
        owner_email: owner_email || null,
        owner_pin: '1234',
        theme_json: themeJson,
        published: true,
      })
      .select()
      .single()

    if (siteError) throw new Error(`Supabase insert error: ${siteError.message}`)

    const servicesData = aiData.services?.length
      ? aiData.services
      : DEFAULT_SERVICES[business_type as BusinessType]

    const staffData = aiData.staff?.length
      ? aiData.staff
      : DEFAULT_STAFF[business_type as BusinessType]

    await supabase.from('services').insert(
      servicesData.map((s: any) => ({
        site_id: site.id,
        name: s.name,
        price: Number(s.price) || 0,
        duration_minutes: Number(s.duration_minutes || s.duration) || 60,
      }))
    )

    await supabase.from('staff').insert(
      staffData.map((s: any) => ({
        site_id: site.id,
        name: s.name,
        role: s.role,
      }))
    )

    return NextResponse.json({ slug, business_name, business_type, site_id: site.id })

  } catch (err: any) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: err.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
