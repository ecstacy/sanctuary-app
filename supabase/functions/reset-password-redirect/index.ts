Deno.serve(async (req) => {
  const url = new URL(req.url)
  
  // Get all params from the URL
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  
  // Build the deep link to your app
  const appDeepLink = `com.sanctuary.app://reset-password?token_hash=${token_hash}&type=${type}`
  
  // Return an HTML page that immediately redirects to the app
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sanctuary — Redirecting...</title>
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
        
        // If still on this page after 2 seconds, show the button
        setTimeout(() => {
          document.getElementById('manual').style.display = 'block';
        }, 2000);
      </script>
    </head>
    <body>
      <p class="logo">🌿 The Sanctuary</p>
      <h1>Opening your app...</h1>
      <p>You will be redirected to The Sanctuary app to reset your password.</p>
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