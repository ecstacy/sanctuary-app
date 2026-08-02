package com.sanctuary.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private String pendingUrl = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register local plugins
        registerPlugin(ExternalBrowserPlugin.class);
        registerPlugin(InstallReferrerPlugin.class);

        super.onCreate(savedInstanceState);
        Uri data = getIntent().getData();
        android.util.Log.d("DeepLink", "onCreate — intent data: " + (data != null ? data.toString() : "null"));
        if (data != null) {
            pendingUrl = data.toString();
            android.util.Log.d("DeepLink", "onCreate — pendingUrl set: " + pendingUrl);
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null) {
                    getBridge().triggerWindowJSEvent("nativeBackButton", "{}");
                }
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Uri data = intent.getData();
        if (data != null) {
            pendingUrl = data.toString();
            android.util.Log.d("DeepLink", "onNewIntent URL stored: " + pendingUrl);
            firePendingUrl();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        firePendingUrl();
    }

    private void firePendingUrl() {
        if (pendingUrl != null && getBridge() != null) {
            final String url = pendingUrl;
            pendingUrl = null;
            android.util.Log.d("DeepLink", "Firing URL: " + url);
            // Encode the URL to make it safe for JSON
            String encodedUrl = url.replace("\\", "\\\\").replace("\"", "\\\"").replace("#", "%23");
            final String jsEvent = "{ detail: { \"url\": \"" + encodedUrl + "\" } }";
            getBridge().getActivity().runOnUiThread(() -> {
                new android.os.Handler().postDelayed(() -> {
                    if (getBridge() == null || getBridge().getWebView() == null) return;
                    // Dispatch a plain window CustomEvent (App.jsx listens for
                    // 'appUrlOpen'), GUARDED so it no-ops if the WebView JS isn't
                    // ready yet. The old triggerWindowJSEvent ran
                    // `window.Capacitor.triggerEvent(...)`, which at a slow cold
                    // start executed before window.Capacitor existed and threw
                    // "undefined.triggerEvent". Cold-start deep links are still
                    // delivered via Capacitor's getLaunchUrl() on the JS side.
                    final String js =
                        "if (window.Capacitor) { window.dispatchEvent(new CustomEvent('appUrlOpen', "
                        + jsEvent + ")); }";
                    getBridge().getWebView().evaluateJavascript(js, null);
                    android.util.Log.d("DeepLink", "Event dispatched (guarded): " + jsEvent);
                }, 1500);
            });
        }
    }
}