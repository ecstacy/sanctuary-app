Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  const appDeepLink = `com.sanctuary.app://login?code=${encodeURIComponent(code)}`

  // Serve an HTML page that redirects to the app via JavaScript.
  // Same proven pattern as reset-password-redirect.
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Sanctuary</title>
<style>
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fbf9f4;font-family:Georgia,serif;text-align:center;padding:40px 20px}
h1{color:#31332e;font-size:24px;margin-bottom:12px}
p{color:#5e6059;font-size:15px;line-height:1.7;max-width:320px}
.btn{display:inline-block;margin-top:24px;padding:16px 40px;background:#50644b;color:#eaffe1;border-radius:9999px;text-decoration:none;font-family:Helvetica,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
</style>
</head>
<body>
<p style="color:#50644b;font-size:20px;font-style:italic;margin-bottom:32px">The Sanctuary</p>
<h1>Signing you in...</h1>
<p>Tap the button below to return to the app.</p>
<a href="${appDeepLink}" class="btn">Open The Sanctuary</a>
<script>window.location.href="${appDeepLink}";</script>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
})
