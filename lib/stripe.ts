import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in .env.local')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
})

// ─── PRICING ──────────────────────────────────────────────────────
export const KITA_PRICING = {
  setup: {
    amount: 15000,          // $150.00 in cents
    currency: 'usd',
    name: 'KITA Website Setup',
    description: 'One-time setup fee — AI-generated booking website for your business',
  },
  monthly: {
    amount: 2900,           // $29.00 in cents
    currency: 'usd',
    name: 'KITA Monthly Hosting',
    description: 'Monthly hosting, maintenance, and booking system',
  },
}

// ─── HELPERS ──────────────────────────────────────────────────────
export function formatAmount(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}
