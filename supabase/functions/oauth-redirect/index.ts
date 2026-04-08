Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Supabase PKCE flow sends ?code=xxx after OAuth completes
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  // Build the deep link to the app
  const appDeepLink = `com.sanctuary.app://login?code=${encodeURIComponent(code)}`

  // Use a 302 redirect to the custom scheme deep link.
  // Also serve an HTML body as fallback for clients that don't follow
  // custom-scheme redirects automatically.
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Sanctuary</title>
<meta http-equiv="refresh" content="0;url=${appDeepLink}">
<style>
body { margin:0; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fbf9f4; font-family:Georgia,serif; text-align:center; padding:40px 20px; }
.logo { color:#50644b; font-size:20px; font-style:italic; margin-bottom:32px; }
h1 { color:#31332e; font-size:28px; margin-bottom:12px; }
p { color:#5e6059; font-size:15px; line-height:1.7; max-width:320px; }
.btn { display:inline-block; margin-top:32px; padding:16px 40px; background:#50644b; color:#eaffe1; border-radius:9999px; text-decoration:none; font-family:Helvetica,sans-serif; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; }
</style>
</head>
<body>
<p class="logo">The Sanctuary</p>
<h1>Signing you in...</h1>
<p>You will be redirected to The Sanctuary app momentarily.</p>
<p style="margin-top:24px"><a href="${appDeepLink}" class="btn">Open The Sanctuary</a></p>
</body>
</html>`

  return new Response(html, {
    status: 302,
    headers: {
      'Location': appDeepLink,
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})
