// ─── SUPPORTED CURRENCIES ────────────────────────────────────────
// Used in generate form and displayed throughout the site

export interface Currency {
  code: string
  symbol: string
  name: string
  flag: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
]

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$'
}

export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount}`
}
