// ─── WHITE LABEL CONFIGURATION ───────────────────────────────────
// Controls branding on public sites and owner dashboards.
// Configure via environment variables in .env.local or Vercel dashboard.
//
// NEXT_PUBLIC_WHITE_LABEL_MODE=on  → hides all KITA branding
// NEXT_PUBLIC_WHITE_LABEL_MODE=off → shows KITA branding (default)

export interface WhiteLabelConfig {
  enabled: boolean
  agencyName: string
  agencyTagline: string
  agencyUrl: string
  agencyLogoUrl: string | null
  showPoweredBy: boolean   // show "Powered by {agencyName}" on public sites
  showDashboardBrand: boolean // show agency name in owner dashboard header
}

export function getWhiteLabelConfig(): WhiteLabelConfig {
  const enabled = process.env.NEXT_PUBLIC_WHITE_LABEL_MODE === 'on'
  const agencyName = process.env.NEXT_PUBLIC_AGENCY_NAME || 'KITA Systems'
  const agencyTagline = process.env.NEXT_PUBLIC_AGENCY_TAGLINE || 'From Struggle to Booked.'
  const agencyUrl = process.env.NEXT_PUBLIC_AGENCY_URL || 'https://kita-builder-systems.vercel.app'
  const agencyLogoUrl = process.env.NEXT_PUBLIC_AGENCY_LOGO_URL || null

  return {
    enabled,
    agencyName,
    agencyTagline,
    agencyUrl,
    agencyLogoUrl,
    showPoweredBy: !enabled || agencyName !== 'KITA Systems',
    showDashboardBrand: true,
  }
}

// Per-site white-label — stored in theme_json.white_label
export interface SiteWhiteLabel {
  enabled: boolean        // override white-label for this specific site
  custom_footer: string   // e.g. "Powered by Sydney Web Co." — blank = use global
  hide_footer_brand: boolean  // true = no branding at all in footer
}

export function getSiteWhiteLabel(themeJson: any): SiteWhiteLabel {
  return {
    enabled: themeJson?.white_label?.enabled ?? false,
    custom_footer: themeJson?.white_label?.custom_footer ?? '',
    hide_footer_brand: themeJson?.white_label?.hide_footer_brand ?? false,
  }
}
