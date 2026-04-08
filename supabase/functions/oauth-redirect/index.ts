Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Supabase PKCE flow sends ?code=xxx after OAuth completes
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  // Build the deep link to the app
  const appDeepLink = `com.sanctuary.app://login?code=${encodeURIComponent(code)}`

  // Return an HTML page that immediately redirects to the app
  // (same pattern as reset-password-redirect which works reliably)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sanctuary — Signing you in...</title>
      <style>
        body {
          margin: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #fbf9f4;
          font-family: Georgia, serif;
          text-align: center;
          padding: 40px 20px;
        }
        .logo { color: #50644b; font-size: 20px; font-style: italic; margin-bottom: 32px; }
        h1 { color: #31332e; font-size: 28px; margin-bottom: 12px; }
        p { color: #5e6059; font-size: 15px; line-height: 1.7; max-width: 320px; }
        .btn {
          display: inline-block;
          margin-top: 32px;
          padding: 16px 40px;
          background-color: #50644b;
          color: #eaffe1;
          border-radius: 9999px;
          text-decoration: none;
          font-family: Helvetica, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      </style>
      <script>
        // Try to open the app immediately
        window.location.href = "${appDeepLink}";

        // If still on this page after 2 seconds, show the manual button
        setTimeout(() => {
          document.getElementById('manual').style.display = 'block';
        }, 2000);
      </script>
    </head>
    <body>
      <p class="logo">🌿 The Sanctuary</p>
      <h1>Signing you in...</h1>
      <p>You will be redirected to The Sanctuary app momentarily.</p>
      <div id="manual" style="display:none">
        <p>If the app didn't open automatically, tap the button below.</p>
        <a href="${appDeepLink}" class="btn">Open The Sanctuary</a>
      </div>
    </body>
    </html>
  `

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
})
