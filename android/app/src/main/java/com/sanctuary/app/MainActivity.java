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
        // Register the ExternalBrowser plugin
        registerPlugin(ExternalBrowserPlugin.class);

        super.onCreate(savedInstanceState);
        Uri data = getIntent().getData();
        if (data != null) {
            pendingUrl = data.toString();
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
            final String jsEvent = "{ \"url\": \"" + encodedUrl + "\" }";
            getBridge().getActivity().runOnUiThread(() -> {
                new android.os.Handler().postDelayed(() -> {
                    getBridge().triggerWindowJSEvent("appUrlOpen", jsEvent);
                    android.util.Log.d("DeepLink", "Event fired: " + jsEvent);
                }, 1500);
            });
        }
    }
}