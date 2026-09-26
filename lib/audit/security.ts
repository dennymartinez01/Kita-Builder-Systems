import type { AnalyzerResult, AuditIssue } from './types'

export async function analyzeSecurity(url: string): Promise<AnalyzerResult> {
  const issues: AuditIssue[] = []
  const data: Record<string, any> = {}

  try {
    const parsedUrl = new URL(url)
    data.is_https = parsedUrl.protocol === 'https:'

    // ── HTTPS CHECK ───────────────────────────────────────────────
    if (parsedUrl.protocol !== 'https:') {
      issues.push({
        category: 'security',
        severity: 'critical',
        title: 'Site not using HTTPS',
        description: 'The site is served over HTTP, not HTTPS. All data is transmitted insecurely.',
        recommendation: 'Install an SSL certificate and force HTTPS. Most hosts provide free SSL via Let\'s Encrypt.',
      })
    }

    // ── HTTP → HTTPS REDIRECT ────────────────────────────────────
    if (parsedUrl.protocol === 'https:') {
      try {
        const httpUrl = url.replace('https://', 'http://')
        const redirectRes = await fetch(httpUrl, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
        })
        const location = redirectRes.headers.get('location') || ''
        data.http_redirects_to_https = location.startsWith('https:')
        if (!data.http_redirects_to_https) {
          issues.push({
            category: 'security',
            severity: 'medium',
            title: 'HTTP does not redirect to HTTPS',
            description: 'Accessing the HTTP version does not automatically redirect to HTTPS.',
            recommendation: 'Configure a 301 redirect from HTTP to HTTPS at the server or CDN level.',
          })
        }
      } catch {
        data.http_redirects_to_https = null
      }
    }

    // ── FETCH SECURITY HEADERS ────────────────────────────────────
    let headers: Headers | null = null
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
      })
      headers = res.headers
    } catch {
      // Try GET if HEAD fails
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
        headers = res.headers
      } catch (err: any) {
        data.headers_error = err.message
      }
    }

    if (headers) {
      // HSTS
      const hsts = headers.get('strict-transport-security')
      data.hsts = hsts || null
      if (!hsts) {
        issues.push({
          category: 'security',
          severity: 'high',
          title: 'Missing HSTS header',
          description: 'Strict-Transport-Security header is not set.',
          recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        })
      } else if (!hsts.includes('max-age=31536000') && !hsts.includes('max-age=63072000')) {
        issues.push({
          category: 'security',
          severity: 'low',
          title: 'HSTS max-age too short',
          description: `HSTS max-age should be at least 1 year (31536000). Current: ${hsts}`,
          recommendation: 'Set max-age=31536000 or higher.',
        })
      }

      // X-Frame-Options
      const xframe = headers.get('x-frame-options')
      data.x_frame_options = xframe || null
      if (!xframe) {
        issues.push({
          category: 'security',
          severity: 'medium',
          title: 'Missing X-Frame-Options header',
          description: 'Site may be vulnerable to clickjacking attacks.',
          recommendation: 'Add: X-Frame-Options: SAMEORIGIN',
        })
      }

      // X-Content-Type-Options
      const xcto = headers.get('x-content-type-options')
      data.x_content_type_options = xcto || null
      if (!xcto || xcto.toLowerCase() !== 'nosniff') {
        issues.push({
          category: 'security',
          severity: 'medium',
          title: 'Missing X-Content-Type-Options header',
          description: 'Browser may attempt to MIME-sniff content types.',
          recommendation: 'Add: X-Content-Type-Options: nosniff',
        })
      }

      // Content-Security-Policy
      const csp = headers.get('content-security-policy')
      data.csp = csp || null
      if (!csp) {
        issues.push({
          category: 'security',
          severity: 'medium',
          title: 'Missing Content Security Policy (CSP)',
          description: 'No CSP header found. Site may be vulnerable to XSS attacks.',
          recommendation: 'Implement a Content-Security-Policy header to restrict resource loading.',
        })
      }

      // Referrer-Policy
      const referrer = headers.get('referrer-policy')
      data.referrer_policy = referrer || null
      if (!referrer) {
        issues.push({
          category: 'security',
          severity: 'low',
          title: 'Missing Referrer-Policy header',
          description: 'No Referrer-Policy header found.',
          recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
        })
      }

      // Permissions-Policy
      const permissions = headers.get('permissions-policy')
      data.permissions_policy = permissions || null
      if (!permissions) {
        issues.push({
          category: 'security',
          severity: 'info',
          title: 'Missing Permissions-Policy header',
          description: 'No Permissions-Policy header to restrict browser features.',
          recommendation: 'Consider adding Permissions-Policy to restrict camera, microphone, geolocation access.',
        })
      }

      // Server header leaking info
      const server = headers.get('server')
      data.server_header = server || null
      if (server && (server.toLowerCase().includes('apache') || server.toLowerCase().includes('nginx') || server.toLowerCase().includes('iis'))) {
        issues.push({
          category: 'security',
          severity: 'low',
          title: 'Server header reveals technology',
          description: `Server header exposes: "${server}"`,
          recommendation: 'Remove or obscure the Server header to prevent technology fingerprinting.',
        })
      }
    }

    // ── CALCULATE SCORE ───────────────────────────────────────────
    let score = 100
    for (const issue of issues) {
      if (issue.severity === 'critical') score -= 30
      else if (issue.severity === 'high') score -= 20
      else if (issue.severity === 'medium') score -= 10
      else if (issue.severity === 'low') score -= 5
      else if (issue.severity === 'info') score -= 2
    }
    score = Math.max(0, Math.min(100, score))

    return { score, issues, data }
  } catch (err: any) {
    return {
      score: 0,
      issues: [{
        category: 'security',
        severity: 'info',
        title: 'Security analysis failed',
        description: err.message,
        recommendation: 'Ensure the URL is publicly accessible.',
      }],
      data: { error: err.message },
    }
  }
}
