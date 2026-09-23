import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai'
import { createServerClient } from '@/lib/supabase'

// ─── AGENT ACTIONS ────────────────────────────────────────────────
// These are the only things the AI is allowed to do.
// This keeps it safe — no arbitrary DB queries, no deletions without intent.

const AGENT_TOOLS = [
  {
    name: 'update_service_price',
    description: 'Update the price of an existing service. Use when user says things like "change oil change to $150" or "make haircut $80".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service_name_hint: { type: Type.STRING, description: 'Part of the service name to match (case-insensitive)' },
        new_price: { type: Type.NUMBER, description: 'The new price in dollars' },
      },
      required: ['service_name_hint', 'new_price'],
    },
  },
  {
    name: 'update_service_name',
    description: 'Rename an existing service. Use when user says "rename X to Y" or "call it X instead".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        old_name_hint: { type: Type.STRING, description: 'Part of the current service name to match' },
        new_name: { type: Type.STRING, description: 'The new name for the service' },
      },
      required: ['old_name_hint', 'new_name'],
    },
  },
  {
    name: 'update_service_duration',
    description: 'Change how long a service takes. Use when user says "make oil change 45 minutes".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service_name_hint: { type: Type.STRING, description: 'Part of the service name to match' },
        new_duration_minutes: { type: Type.NUMBER, description: 'New duration in minutes' },
      },
      required: ['service_name_hint', 'new_duration_minutes'],
    },
  },
  {
    name: 'add_service',
    description: 'Add a brand new service. Use when user says "add a service", "I also do X for $Y".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Service name' },
        price: { type: Type.NUMBER, description: 'Price in dollars' },
        duration_minutes: { type: Type.NUMBER, description: 'Duration in minutes (default 60)' },
      },
      required: ['name', 'price'],
    },
  },
  {
    name: 'delete_service',
    description: 'Remove a service. Use when user says "remove X", "delete X", "we no longer offer X".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service_name_hint: { type: Type.STRING, description: 'Part of the service name to match and delete' },
      },
      required: ['service_name_hint'],
    },
  },
  {
    name: 'update_headline',
    description: 'Change the hero headline. Use when user says "change the title to", "update the headline to".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_headline: { type: Type.STRING, description: 'The new headline text' },
      },
      required: ['new_headline'],
    },
  },
  {
    name: 'update_subheadline',
    description: 'Change the subtitle text. Use when user says "change the subtitle to".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_sub: { type: Type.STRING, description: 'The new subtitle text' },
      },
      required: ['new_sub'],
    },
  },
  {
    name: 'update_about',
    description: 'Update the About section text. Use when user says "update about us", "change the about section".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_body: { type: Type.STRING, description: 'The new about section body text' },
      },
      required: ['new_body'],
    },
  },
  {
    name: 'list_services',
    description: 'Show all current services. Use when user asks "what services do I have", "show me my services".',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
] as FunctionDeclaration[]

// ─── EXECUTE ACTIONS ─────────────────────────────────────────────
async function executeAction(
  toolName: string,
  args: Record<string, any>,
  siteId: string,
): Promise<{ success: boolean; message: string; data?: any }> {
  const supabase = createServerClient()

  switch (toolName) {
    case 'update_service_price': {
      const { data: services } = await supabase
        .from('services').select('*').eq('site_id', siteId)
      const match = services?.find(s =>
        s.name.toLowerCase().includes(args.service_name_hint.toLowerCase())
      )
      if (!match) return { success: false, message: `No service found matching "${args.service_name_hint}". Try using a clearer name.` }
      await supabase.from('services').update({ price: args.new_price }).eq('id', match.id)
      return { success: true, message: `Updated **${match.name}** price to **$${args.new_price}**. Live on your site now.` }
    }

    case 'update_service_name': {
      const { data: services } = await supabase
        .from('services').select('*').eq('site_id', siteId)
      const match = services?.find(s =>
        s.name.toLowerCase().includes(args.old_name_hint.toLowerCase())
      )
      if (!match) return { success: false, message: `No service found matching "${args.old_name_hint}".` }
      await supabase.from('services').update({ name: args.new_name }).eq('id', match.id)
      return { success: true, message: `Renamed **${match.name}** to **${args.new_name}**. Live on your site now.` }
    }

    case 'update_service_duration': {
      const { data: services } = await supabase
        .from('services').select('*').eq('site_id', siteId)
      const match = services?.find(s =>
        s.name.toLowerCase().includes(args.service_name_hint.toLowerCase())
      )
      if (!match) return { success: false, message: `No service found matching "${args.service_name_hint}".` }
      await supabase.from('services').update({ duration_minutes: args.new_duration_minutes }).eq('id', match.id)
      return { success: true, message: `Updated **${match.name}** duration to **${args.new_duration_minutes} minutes**.` }
    }

    case 'add_service': {
      const { data: newService } = await supabase.from('services').insert({
        site_id: siteId,
        name: args.name,
        price: args.price,
        duration_minutes: args.duration_minutes || 60,
      }).select().single()
      return { success: true, message: `Added new service **${args.name}** for **$${args.price}** (${args.duration_minutes || 60} min). It's live on your site.`, data: newService }
    }

    case 'delete_service': {
      const { data: services } = await supabase
        .from('services').select('*').eq('site_id', siteId)
      const match = services?.find(s =>
        s.name.toLowerCase().includes(args.service_name_hint.toLowerCase())
      )
      if (!match) return { success: false, message: `No service found matching "${args.service_name_hint}".` }
      await supabase.from('services').delete().eq('id', match.id)
      return { success: true, message: `Removed **${match.name}** from your services. It's been deleted from your site.` }
    }

    case 'update_headline': {
      const { data: site } = await supabase
        .from('sites').select('theme_json').eq('id', siteId).single()
      if (!site) return { success: false, message: 'Site not found.' }
      const themeJson = site.theme_json as any
      const updated = {
        ...themeJson,
        sections: themeJson.sections.map((s: any) =>
          s.type === 'hero' ? { ...s, data: { ...s.data, headline: args.new_headline } } : s
        ),
      }
      await supabase.from('sites').update({ theme_json: updated }).eq('id', siteId)
      return { success: true, message: `Updated headline to **"${args.new_headline}"**. Refresh your site to see it.` }
    }

    case 'update_subheadline': {
      const { data: site } = await supabase
        .from('sites').select('theme_json').eq('id', siteId).single()
      if (!site) return { success: false, message: 'Site not found.' }
      const themeJson = site.theme_json as any
      const updated = {
        ...themeJson,
        sections: themeJson.sections.map((s: any) =>
          s.type === 'hero' ? { ...s, data: { ...s.data, sub: args.new_sub } } : s
        ),
      }
      await supabase.from('sites').update({ theme_json: updated }).eq('id', siteId)
      return { success: true, message: `Updated subtitle to **"${args.new_sub}"**. Refresh your site to see it.` }
    }

    case 'update_about': {
      const { data: site } = await supabase
        .from('sites').select('theme_json').eq('id', siteId).single()
      if (!site) return { success: false, message: 'Site not found.' }
      const themeJson = site.theme_json as any
      const updated = {
        ...themeJson,
        sections: themeJson.sections.map((s: any) =>
          s.type === 'about' ? { ...s, data: { ...s.data, body: args.new_body } } : s
        ),
      }
      await supabase.from('sites').update({ theme_json: updated }).eq('id', siteId)
      return { success: true, message: `Updated your About section. Refresh your site to see it.` }
    }

    case 'list_services': {
      const { data: services } = await supabase
        .from('services').select('*').eq('site_id', siteId).order('price')
      if (!services?.length) return { success: true, message: 'You have no services set up yet.' }
      const list = services.map(s => `• **${s.name}** — $${s.price} (${s.duration_minutes} min)`).join('\n')
      return { success: true, message: `Here are your current services:\n\n${list}` }
    }

    default:
      return { success: false, message: 'Unknown action.' }
  }
}

// ─── API ROUTE ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, site_id, history = [] } = await req.json()

    if (!message || !site_id) {
      return NextResponse.json({ error: 'message and site_id are required.' }, { status: 400 })
    }

    // Get site context so AI knows what it's working with
    const supabase = createServerClient()
    const { data: site } = await supabase
      .from('sites').select('business_name, business_type').eq('id', site_id).single()
    const { data: services } = await supabase
      .from('services').select('name, price, duration_minutes').eq('site_id', site_id)

    const siteContext = site
      ? `You are an AI assistant managing the website for "${site.business_name}" (${site.business_type}).
Current services: ${services?.map(s => `${s.name} ($${s.price}, ${s.duration_minutes}min)`).join(', ') || 'none'}.
Help the owner update their website by calling the available tools. Be concise and friendly.
Always call a tool to make the change — don't just describe it.`
      : 'You are an AI assistant helping manage a business website.'

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    // Build conversation history for context
    const contents: any[] = [
      ...history.slice(-6).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']
    let response = null

    for (const modelName of MODELS) {
      try {
        response = await genAI.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: siteContext,
            tools: [{ functionDeclarations: AGENT_TOOLS }],
            temperature: 0.3, // lower temp = more deterministic for tool calls
          },
        })
        break
      } catch (err: any) {
        const msg = err.message || ''
        if (!msg.includes('503') && !msg.includes('NOT_FOUND') && !msg.includes('unavailable')) throw err
        console.warn(`[agent] Model ${modelName} unavailable, trying next...`)
      }
    }

    if (!response) throw new Error('All Gemini models unavailable. Try again in a moment.')

    // Check if AI wants to call a tool
    const candidate = response.candidates?.[0]
    const part = candidate?.content?.parts?.[0]

    if (part?.functionCall) {
      const { name: fnName, args } = part.functionCall
      if (!fnName) throw new Error('No function name returned')
      const result = await executeAction(fnName, args as Record<string, any>, site_id)
      return NextResponse.json({
        reply: result.message,
        action: fnName,
        success: result.success,
        data: result.data,
      })
    }

    // Plain text response (no tool call)
    const textReply = part?.text || "I'm not sure how to do that. Try saying something like: \"change my oil change to $150\" or \"add a new service: Tyre Rotation $60\"."
    return NextResponse.json({ reply: textReply, action: null, success: true })

  } catch (err: any) {
    console.error('[/api/agent]', err)
    return NextResponse.json({ error: err.message || 'Agent failed' }, { status: 500 })
  }
}
