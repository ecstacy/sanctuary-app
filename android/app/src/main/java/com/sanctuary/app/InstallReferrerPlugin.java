package com.sanctuary.app;

import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;
import com.android.installreferrer.api.ReferrerDetails;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Reads the Google Play Install Referrer once, so the app can attribute its
 * install to the utm_* params the website's store badge carried
 * (docs/growth-plan.md §4). The JS side (src/lib/installReferrer.js) guards
 * that this is only ever consumed on first launch.
 *
 * Sideloaded/adb installs resolve with ok=false (SERVICE_UNAVAILABLE or an
 * empty organic referrer) — callers must treat that as "no attribution", not
 * an error.
 */
@CapacitorPlugin(name = "InstallReferrer")
public class InstallReferrerPlugin extends Plugin {

    @PluginMethod
    public void getReferrer(final PluginCall call) {
        final InstallReferrerClient client =
            InstallReferrerClient.newBuilder(getContext()).build();

        client.startConnection(new InstallReferrerStateListener() {
            @Override
            public void onInstallReferrerSetupFinished(int responseCode) {
                JSObject ret = new JSObject();
                try {
                    if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                        ReferrerDetails details = client.getInstallReferrer();
                        ret.put("ok", true);
                        ret.put("referrer", details.getInstallReferrer());
                        ret.put("clickTs", details.getReferrerClickTimestampSeconds());
                        ret.put("installTs", details.getInstallBeginTimestampSeconds());
                    } else {
                        // FEATURE_NOT_SUPPORTED / SERVICE_UNAVAILABLE — normal
                        // for sideloads, emulators, and non-Play devices.
                        ret.put("ok", false);
                        ret.put("code", responseCode);
                    }
                } catch (Exception e) {
                    ret.put("ok", false);
                    ret.put("error", e.getMessage());
                } finally {
                    try { client.endConnection(); } catch (Exception ignored) { }
                }
                call.resolve(ret);
            }

            @Override
            public void onInstallReferrerServiceDisconnected() {
                // Transient; we don't retry — the JS side simply won't mark
                // the read as consumed and tries again next launch.
                JSObject ret = new JSObject();
                ret.put("ok", false);
                ret.put("error", "service_disconnected");
                call.resolve(ret);
            }
        });
    }
}
