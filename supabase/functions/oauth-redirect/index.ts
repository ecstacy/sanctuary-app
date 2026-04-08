Deno.serve(async (_req) => {
  // With implicit flow, Supabase redirects here with tokens in the
  // URL fragment (#access_token=xxx&refresh_token=yyy).
  // Fragments are NOT sent to the server — only client-side JS can read them.
  //
  // This page:
  // 1. Reads the tokens from window.location.hash (client-side)
  // 2. Builds a deep link with tokens as query params (Android preserves these)
  // 3. Shows a button the user taps to open the app
  //    (Android 12+ blocks auto JS redirects to custom schemes,
  //     but user-tapped links work reliably)

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Sanctuary</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fbf9f4;font-family:Georgia,serif;text-align:center;padding:40px 24px}
.logo{color:#50644b;font-size:20px;font-style:italic;margin-bottom:32px}
h1{color:#31332e;font-size:24px;margin-bottom:8px;font-weight:normal}
p{color:#5e6059;font-size:14px;line-height:1.6;max-width:300px;margin:0 auto}
.btn{display:inline-block;margin-top:32px;padding:18px 48px;background:#50644b;color:#eaffe1;border-radius:9999px;text-decoration:none;font-family:Helvetica,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;-webkit-tap-highlight-color:transparent}
.btn:active{transform:scale(0.97);opacity:0.9}
.error{color:#a73b21;margin-top:20px;font-size:13px}
.spinner{margin:24px auto;width:32px;height:32px;border:3px solid #50644b33;border-top-color:#50644b;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#ready{display:none}
</style>
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

<div id="errorMsg" class="error" style="display:none"></div>

<script>
(function() {
  // Read tokens from the URL fragment
  var hash = window.location.hash.substring(1);
  if (!hash) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsg').textContent = 'Authentication failed. Please try again.';
    return;
  }

  var params = new URLSearchParams(hash);
  var accessToken = params.get('access_token');
  var refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsg').textContent = 'Authentication failed. Please try again.';
    return;
  }

  // Build deep link with tokens as query params (Android preserves query params)
  var deepLink = 'com.sanctuary.app://login?access_token=' +
    encodeURIComponent(accessToken) +
    '&refresh_token=' + encodeURIComponent(refreshToken);

  // Set the button href
  document.getElementById('openApp').href = deepLink;

  // Show the button
  document.getElementById('loading').style.display = 'none';
  document.getElementById('ready').style.display = 'block';

  // Also try automatic redirect (works on some devices)
  window.location.href = deepLink;
})();
</script>
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
