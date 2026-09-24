// Client-safe pricing constants — no Stripe SDK, no secret keys
// Import this in client components instead of lib/stripe.ts

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

export function formatAmount(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}
