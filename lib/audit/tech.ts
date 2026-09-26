import type { AnalyzerResult, AuditIssue } from './types'

interface TechDetection {
  name: string
  category: 'framework' | 'cms' | 'ecommerce' | 'analytics' | 'marketing' | 'hosting' | 'other'
  confidence: 'high' | 'medium' | 'low'
}

export async function analyzeTech(url: string, html: string, headers: Record<string, string>): Promise<AnalyzerResult> {
  const issues: AuditIssue[] = []
  const detected: TechDetection[] = []
  const data: Record<string, any> = {}

  const lowerHtml = html.toLowerCase()

  // ── FRAMEWORKS ────────────────────────────────────────────────
  if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
    detected.push({ name: 'Next.js', category: 'framework', confidence: 'high' })
  }
  if (html.includes('data-reactroot') || html.includes('react-dom') || lowerHtml.includes('__react')) {
    detected.push({ name: 'React', category: 'framework', confidence: 'high' })
  }
  if (html.includes('ng-version') || html.includes('ng-app') || html.includes('angular')) {
    detected.push({ name: 'Angular', category: 'framework', confidence: 'high' })
  }
  if (html.includes('__vue') || html.includes('data-v-') || html.includes('vue.js')) {
    detected.push({ name: 'Vue.js', category: 'framework', confidence: 'high' })
  }
  if (html.includes('nuxt') || html.includes('__NUXT__')) {
    detected.push({ name: 'Nuxt.js', category: 'framework', confidence: 'high' })
  }
  if (html.includes('gatsby') || html.includes('___gatsby')) {
    detected.push({ name: 'Gatsby', category: 'framework', confidence: 'high' })
  }
  if (html.includes('svelte') || html.includes('__svelte')) {
    detected.push({ name: 'Svelte', category: 'framework', confidence: 'medium' })
  }

  // ── CMS ───────────────────────────────────────────────────────
  if (html.includes('/wp-content/') || html.includes('/wp-includes/') || html.includes('wp-json')) {
    detected.push({ name: 'WordPress', category: 'cms', confidence: 'high' })
  }
  if (html.includes('drupal') || html.includes('Drupal.settings')) {
    detected.push({ name: 'Drupal', category: 'cms', confidence: 'high' })
  }
  if (html.includes('joomla') || html.includes('/media/jui/')) {
    detected.push({ name: 'Joomla', category: 'cms', confidence: 'high' })
  }
  if (html.includes('ghost') || html.includes('/ghost/')) {
    detected.push({ name: 'Ghost', category: 'cms', confidence: 'medium' })
  }
  if (html.includes('webflow') || lowerHtml.includes('webflow.com')) {
    detected.push({ name: 'Webflow', category: 'cms', confidence: 'high' })
  }
  if (html.includes('squarespace') || lowerHtml.includes('static1.squarespace')) {
    detected.push({ name: 'Squarespace', category: 'cms', confidence: 'high' })
  }
  if (lowerHtml.includes('wix.com') || html.includes('wixsite')) {
    detected.push({ name: 'Wix', category: 'cms', confidence: 'high' })
  }

  // ── ECOMMERCE ─────────────────────────────────────────────────
  if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) {
    detected.push({ name: 'Shopify', category: 'ecommerce', confidence: 'high' })
  }
  if (html.includes('woocommerce') || html.includes('woo-')) {
    detected.push({ name: 'WooCommerce', category: 'ecommerce', confidence: 'high' })
  }
  if (html.includes('magento') || html.includes('Magento')) {
    detected.push({ name: 'Magento', category: 'ecommerce', confidence: 'high' })
  }

  // ── ANALYTICS ────────────────────────────────────────────────
  if (html.includes('google-analytics.com') || html.includes('gtag(') || html.includes('ga(')) {
    detected.push({ name: 'Google Analytics', category: 'analytics', confidence: 'high' })
  }
  if (html.includes('googletagmanager.com')) {
    detected.push({ name: 'Google Tag Manager', category: 'analytics', confidence: 'high' })
  }
  if (html.includes('hotjar.com') || html.includes('hj(')) {
    detected.push({ name: 'Hotjar', category: 'analytics', confidence: 'high' })
  }
  if (html.includes('plausible.io')) {
    detected.push({ name: 'Plausible Analytics', category: 'analytics', confidence: 'high' })
  }
  if (html.includes('segment.com') || html.includes('analytics.js')) {
    detected.push({ name: 'Segment', category: 'analytics', confidence: 'medium' })
  }

  // ── MARKETING ────────────────────────────────────────────────
  if (html.includes('intercom')) {
    detected.push({ name: 'Intercom', category: 'marketing', confidence: 'high' })
  }
  if (html.includes('hubspot') || html.includes('hs-scripts')) {
    detected.push({ name: 'HubSpot', category: 'marketing', confidence: 'high' })
  }
  if (html.includes('mailchimp')) {
    detected.push({ name: 'Mailchimp', category: 'marketing', confidence: 'medium' })
  }
  if (html.includes('crisp.chat')) {
    detected.push({ name: 'Crisp Chat', category: 'marketing', confidence: 'high' })
  }
  if (html.includes('tawk.to')) {
    detected.push({ name: 'Tawk.to', category: 'marketing', confidence: 'high' })
  }

  // ── HOSTING / SERVER (from headers) ──────────────────────────
  const server = headers['server'] || ''
  const via = headers['via'] || ''
  const cfRay = headers['cf-ray'] || ''
  const xVercel = headers['x-vercel-id'] || ''
  const xNetlify = headers['x-nf-request-id'] || ''

  if (cfRay) detected.push({ name: 'Cloudflare', category: 'hosting', confidence: 'high' })
  if (xVercel) detected.push({ name: 'Vercel', category: 'hosting', confidence: 'high' })
  if (xNetlify) detected.push({ name: 'Netlify', category: 'hosting', confidence: 'high' })
  if (server.toLowerCase().includes('nginx')) detected.push({ name: 'Nginx', category: 'hosting', confidence: 'high' })
  if (server.toLowerCase().includes('apache')) detected.push({ name: 'Apache', category: 'hosting', confidence: 'high' })
  if (server.toLowerCase().includes('cloudfront')) detected.push({ name: 'AWS CloudFront', category: 'hosting', confidence: 'high' })

  // ── CSS FRAMEWORKS ────────────────────────────────────────────
  if (html.includes('tailwindcss') || html.includes('tw-') || lowerHtml.includes('tailwind')) {
    detected.push({ name: 'Tailwind CSS', category: 'framework', confidence: 'medium' })
  }
  if (html.includes('bootstrap') && (html.includes('btn-primary') || html.includes('col-md'))) {
    detected.push({ name: 'Bootstrap', category: 'framework', confidence: 'high' })
  }

  // ── DEDUPLICATE ──────────────────────────────────────────────
  const unique = detected.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i)
  data.stack = unique
  data.tech_count = unique.length

  // ── ISSUES / RECOMMENDATIONS ─────────────────────────────────
  const hasAnalytics = unique.some(t => t.category === 'analytics')
  if (!hasAnalytics) {
    issues.push({
      category: 'tech',
      severity: 'medium',
      title: 'No analytics tool detected',
      description: 'No analytics platform detected on this site.',
      recommendation: 'Add Google Analytics or Plausible to track visitor behaviour.',
    })
  }

  const hasWordPress = unique.some(t => t.name === 'WordPress')
  if (hasWordPress) {
    issues.push({
      category: 'tech',
      severity: 'info',
      title: 'WordPress detected',
      description: 'Site is built on WordPress.',
      recommendation: 'Ensure WordPress core, themes, and plugins are kept up to date for security.',
    })
  }

  const score = 70 + (unique.length > 0 ? 10 : 0) + (hasAnalytics ? 10 : 0) + (unique.some(t => t.category === 'hosting') ? 10 : 0)

  return { score: Math.min(100, score), issues, data }
}
