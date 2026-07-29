package in.qrlin.safety;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridges the native call-handling pieces (FCM token, answered-call handoff) to the existing
 * React/WebRTC code, which is otherwise untouched - useCallSignaling.ts and IncomingCallModal.tsx
 * still own the actual call signaling and media, this just tells JS "a call was answered, join
 * this sessionToken" instead of the STOMP push it normally relies on while the app is open.
 */
@CapacitorPlugin(name = "CallBridge")
public class CallBridgePlugin extends Plugin {

    // Set by MainActivity when it's launched/resumed from CallConnection.launchMainActivity() -
    // read once by JS on startup (cold start) and also pushed live via the "callAnswered" event
    // (warm start / already-running app, where onNewIntent fires instead of a fresh onCreate).
    static volatile Bundle pendingCallExtras;

    @PluginMethod
    public void getCurrentToken(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(
                CallFirebaseMessagingService.PREFS_NAME, Context.MODE_PRIVATE);
        String token = prefs.getString(CallFirebaseMessagingService.PREF_FCM_TOKEN, null);
        JSObject result = new JSObject();
        result.put("token", token);
        call.resolve(result);
    }

    @PluginMethod
    public void checkPendingCall(PluginCall call) {
        Bundle extras = pendingCallExtras;
        pendingCallExtras = null;
        call.resolve(extrasToJs(extras));
    }

    void notifyCallAnswered(Bundle extras) {
        notifyListeners("callAnswered", extrasToJs(extras));
    }

    private JSObject extrasToJs(Bundle extras) {
        JSObject result = new JSObject();
        if (extras == null) {
            result.put("sessionToken", (Object) null);
            return result;
        }
        result.put("sessionToken", extras.getString("sessionToken"));
        result.put("tagName", extras.getString("tagName"));
        result.put("qrCode", extras.getString("qrCode"));
        result.put("iceServers", extras.getString("iceServers"));
        return result;
    }
}
