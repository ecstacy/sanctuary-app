Deno.serve(async (_req) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sanctuary</title>
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
        h1 { color: #31332e; font-size: 24px; margin-bottom: 12px; }
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
        .spinner { margin: 20px auto; width: 32px; height: 32px; border: 3px solid #50644b33; border-top-color: #50644b; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        #ready { display: none; }
      </style>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          var hash = window.location.hash.substring(1);
          if (!hash) {
            document.getElementById('loading').innerHTML = '<h1>Authentication failed</h1><p>Please go back to the app and try again.</p>';
            return;
          }

          var params = new URLSearchParams(hash);
          var accessToken = params.get('access_token');
          var refreshToken = params.get('refresh_token');

          if (!accessToken || !refreshToken) {
            document.getElementById('loading').innerHTML = '<h1>Authentication failed</h1><p>Please go back to the app and try again.</p>';
            return;
          }

          var deepLink = 'com.sanctuary.app://login?access_token=' +
            encodeURIComponent(accessToken) + '&refresh_token=' +
            encodeURIComponent(refreshToken);

          document.getElementById('openApp').href = deepLink;
          document.getElementById('loading').style.display = 'none';
          document.getElementById('ready').style.display = 'block';

          window.location.href = deepLink;
        });
      </script>
    </head>
    <body>
      <p class="logo">The Sanctuary</p>
      <div id="loading">
        <h1>Signing you in...</h1>
        <div class="spinner"></div>
      </div>
      <div id="ready">
        <h1>You're signed in!</h1>
        <p>Tap the button below to return to the app.</p>
        <a id="openApp" href="#" class="btn">Open The Sanctuary</a>
      </div>
    </body>
    </html>
  `

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
})
