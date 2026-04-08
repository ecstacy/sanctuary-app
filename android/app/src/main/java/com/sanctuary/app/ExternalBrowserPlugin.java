package com.sanctuary.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ExternalBrowser")
public class ExternalBrowserPlugin extends Plugin {

    @PluginMethod()
    public void open(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("URL is required");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }
}
