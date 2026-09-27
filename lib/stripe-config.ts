import 'server-only'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'

export type StripeMode = 'test' | 'live'

/**
 * Reads the active stripe_mode from admin_config, then returns:
 *   - a Stripe instance initialised with the correct secret key
 *   - the correct webhook secret for that mode
 *   - the mode string itself
 *
 * Falls back to 'test' mode if the DB is unreachable or not yet seeded.
 */
export async function getStripeConfig(): Promise<{
  stripeClient: Stripe
  webhookSecret: string
  mode: StripeMode
}> {
  // Determine active mode from DB (service role bypasses RLS)
  let mode: StripeMode = 'test'
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('admin_config')
      .select('stripe_mode')
      .eq('id', 'singleton')
      .single()
    if (data?.stripe_mode === 'live') mode = 'live'
  } catch {
    // DB unavailable — stay on test
  }

  // Pick the correct key pair
  const secretKey =
    mode === 'live'
      ? process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || ''
      : process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || ''

  const webhookSecret =
    mode === 'live'
      ? process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET || ''
      : process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET || ''

  if (!secretKey) {
    throw new Error(`Missing Stripe secret key for mode "${mode}". Check .env.local.`)
  }

  const stripeClient = new Stripe(secretKey, {
    apiVersion: '2026-08-26.dahlia',
  })

  return { stripeClient, webhookSecret, mode }
}
