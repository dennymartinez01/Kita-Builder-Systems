import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'
import { getTemplate } from '@/lib/templates'
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

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    // Get the base template structure
    const baseTemplate = getTemplate(business_type as BusinessType)

    const prompt = `You are a professional website copywriter for local service businesses.

Business: "${business_name}"
Type: ${business_type}
Location: ${location}
${extra_notes ? `Additional context: ${extra_notes}` : ''}

Generate website copy and business details. Use realistic local pricing for ${location}.
Return ONLY a valid JSON object with this exact structure — no explanation, no markdown, just JSON:
{
  "headline": "compelling hero headline, max 8 words",
  "sub": "supporting subtitle, max 15 words",
  "about_title": "About ${business_name}",
  "about_body": "2-3 sentence about paragraph for this specific business type and location",
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

Rules:
- 3-5 services with realistic ${location} pricing for ${business_type}
- 2-3 staff with appropriate titles for ${business_type}
- 3 testimonials with realistic local names
- Headline must be punchy and specific to ${business_type}
- For mechanic: include oil change, brakes, tyres
- For salon: include haircut, color, styling
- For clinic: include consultation, checkup, treatment
- For pet: include vet visit, grooming, vaccination
- For cafe: include table reservations by group size`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract text content from Claude response
    const rawContent = message.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse JSON — Claude sometimes wraps in ```json blocks, strip if so
    const jsonText = rawContent.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const aiData = JSON.parse(jsonText)

    // Merge AI copy into the base template structure
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
          return {
            ...section,
            data: { items: aiData.testimonials },
          }
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

    // Use AI services/staff if valid, else fall back to template defaults
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

    return NextResponse.json({
      slug,
      business_name,
      business_type,
      site_id: site.id,
    })
  } catch (err: any) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: err.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
