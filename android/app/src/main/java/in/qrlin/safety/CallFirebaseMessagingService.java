package in.qrlin.safety;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * The backend sends CALL_INCOMING/CALL_CANCELLED as data-only, high-priority FCM messages
 * (never a "notification" payload) specifically so this service's onMessageReceived() runs even
 * when the app is backgrounded or fully killed - a notification-payload message would instead be
 * handled directly by the OS tray and never reach app code at all.
 */
public class CallFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "CallFCM";
    static final String PREFS_NAME = "qrlin_prefs";
    static final String PREF_FCM_TOKEN = "fcm_token";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        // Cached, not POSTed directly from here - the JS side reads it (via FcmTokenPlugin) and
        // calls POST /api/devices/register once it has a logged-in user to associate it with.
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(PREF_FCM_TOKEN, token).apply();
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);
        Map<String, String> data = message.getData();
        String type = data.get("type");
        if (type == null) return;

        switch (type) {
            case "CALL_INCOMING":
                handleIncomingCall(data);
                break;
            case "CALL_CANCELLED":
                String cancelledToken = data.get("sessionToken");
                if (cancelledToken != null) {
                    MyConnectionService.endConnectionFor(cancelledToken);
                }
                break;
            default:
                break;
        }
    }

    private void handleIncomingCall(Map<String, String> data) {
        String sessionToken = data.get("sessionToken");
        if (sessionToken == null) return;

        TelecomManager telecomManager = (TelecomManager) getSystemService(Context.TELECOM_SERVICE);
        PhoneAccountHandle handle = new PhoneAccountHandle(
                new ComponentName(this, MyConnectionService.class), MyConnectionService.ACCOUNT_ID);

        Bundle callExtras = new Bundle();
        callExtras.putString("sessionToken", sessionToken);
        callExtras.putString("tagName", data.get("tagName"));
        callExtras.putString("qrCode", data.get("qrCode"));
        callExtras.putString("iceServers", data.get("iceServers"));

        try {
            telecomManager.addNewIncomingCall(handle, callExtras);
        } catch (SecurityException e) {
            // The user hasn't enabled the "Qrlin Safety" calling account yet (Settings > Apps >
            // Default apps > Calling accounts) - MainActivity prompts for this on first login,
            // but until it's granted there's genuinely no way to ring. Nothing more to do here.
            Log.w(TAG, "Cannot add incoming call - phone account not enabled", e);
        }
    }
}
