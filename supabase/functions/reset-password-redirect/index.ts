// ─────────────────────────────────────────────────────────────────────────────
//  reset-password-redirect — bridges the password-reset email to the app
//
//  Supabase sends the recovery email pointing here; we bounce the user into
//  `com.sanctuary.app://reset-password?...` where App.jsx calls verifyOtp().
//
//  ⚠ SECURITY — this page reflects URL params into HTML. It previously
//  interpolated them RAW into both a <script> string and an href attribute:
//
//      window.location.href = "${appDeepLink}";        // JS string context
//      <a href="${appDeepLink}">                       // attribute context
//
//  ...which was a live, confirmed REFLECTED XSS: `?token_hash=x";alert(1);//`
//  broke out of the script string, and `?token_hash=x" onmouseover=...`
//  injected an attribute. Verified against production — an injected marker
//  came back unescaped twice. Because this page appears mid-password-reset on
//  a legitimate-looking URL, the realistic exploit is convincing phishing
//  (swap the page for a "enter your new password" form), not cookie theft
//  (this origin holds no app session).
//
//  Defence is layered, because either layer alone is one refactor from being
//  bypassed:
//    1. VALIDATE  — strict allowlists. `type` must be a known auth type and
//       `token_hash` a safe token charset. Anything else renders a static
//       error page and the input is never echoed.
//    2. ENCODE per context — JSON.stringify for the JS string, HTML-escape
//       for the attribute, encodeURIComponent for the deep-link params.
//
//  NOTE ON verify_jwt: this must stay FALSE. The link is opened from an email
//  in a plain browser with no Supabase JWT, so JWT verification would 401 the
//  user out of their own password reset. config.toml previously claimed
//  `true` while production served 200 unauthenticated — corrected there.
// ─────────────────────────────────────────────────────────────────────────────

// Supabase auth link types. `recovery` is what this function is for; the
// others are accepted so the page keeps working if the email template is
// pointed here for a different flow, without accepting arbitrary values.
const ALLOWED_TYPES = new Set([
  'recovery', 'signup', 'invite', 'magiclink', 'email_change',
])

// Supabase token_hash values are URL-safe base64 / hex. Deliberately strict:
// no quotes, angle brackets, spaces or backslashes can survive this.
const TOKEN_RE = /^[A-Za-z0-9._~-]{1,512}$/

/** Escape for an HTML attribute / text node. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function page(body: string, script = ''): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Sanctuary — Redirecting...</title>
  <style>
    body {
      margin: 0; min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; background-color: #fbf9f4;
      font-family: Georgia, serif; text-align: center; padding: 40px 20px;
    }
    .logo { color: #50644b; font-size: 20px; font-style: italic; margin-bottom: 32px; }
    h1 { color: #31332e; font-size: 28px; margin-bottom: 12px; }
    p { color: #5e6059; font-size: 15px; line-height: 1.7; max-width: 320px; }
    .btn {
      display: inline-block; margin-top: 32px; padding: 16px 40px;
      background-color: #50644b; color: #eaffe1; border-radius: 9999px;
      text-decoration: none; font-family: Helvetica, sans-serif; font-size: 13px;
      font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    }
  </style>
${script}
</head>
<body>
  <p class="logo">🌿 The Sanctuary</p>
${body}
</body>
</html>`
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Defence in depth: even if an escaping bug slipped through, inline
      // script is limited to what we ship and there is nothing to exfiltrate.
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    },
  })
}

Deno.serve((req) => {
  const url = new URL(req.url)
  const tokenHash = url.searchParams.get('token_hash') ?? ''
  const type = url.searchParams.get('type') ?? ''

  // ── 1. Validate. Never echo anything that fails. ──────────────────────
  if (!TOKEN_RE.test(tokenHash) || !ALLOWED_TYPES.has(type)) {
    return htmlResponse(
      page(`
  <h1>This link isn't valid</h1>
  <p>Your reset link may have expired or been altered. Request a new one from
     the app and try again.</p>`),
      400,
    )
  }

  // ── 2. Encode per context. ────────────────────────────────────────────
  const deepLink =
    `com.sanctuary.app://reset-password` +
    `?token_hash=${encodeURIComponent(tokenHash)}` +
    `&type=${encodeURIComponent(type)}`

  // JSON.stringify gives a correctly-quoted, escaped JS string literal.
  const jsLiteral = JSON.stringify(deepLink)
  // Separate escaping for the attribute context.
  const hrefAttr = escapeHtml(deepLink)

  return htmlResponse(page(
    `
  <h1>Opening your app...</h1>
  <p>You will be redirected to The Sanctuary app to reset your password.</p>
  <div id="manual" style="display:none">
    <p>If the app didn't open automatically, tap the button below.</p>
    <a href="${hrefAttr}" class="btn">Open The Sanctuary</a>
  </div>`,
    `  <script>
    window.location.href = ${jsLiteral};
    setTimeout(function () {
      document.getElementById('manual').style.display = 'block';
    }, 2000);
  </script>`,
  ))
})
