package in.qrlin.safety;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telecom.PhoneAccount;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CallBridgePlugin.class);
        super.onCreate(savedInstanceState);
        registerPhoneAccount();
        handleCallIntent(getIntent(), false);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleCallIntent(intent, true);
    }

    // Self-managed PhoneAccount, required before TelecomManager.addNewIncomingCall() will work
    // (CallFirebaseMessagingService calls that when a CALL_INCOMING push arrives). Registering is
    // idempotent - safe to call on every app start. The user still has to explicitly enable this
    // calling account once (Settings > Apps > Default apps > Calling accounts) before Android
    // will actually let it ring; that's covered by the battery-optimization-style onboarding
    // prompt planned for a later phase, not by anything here.
    private void registerPhoneAccount() {
        TelecomManager telecomManager = (TelecomManager) getSystemService(Context.TELECOM_SERVICE);
        PhoneAccountHandle handle = new PhoneAccountHandle(
                new ComponentName(this, MyConnectionService.class), MyConnectionService.ACCOUNT_ID);
        PhoneAccount account = PhoneAccount.builder(handle, "Qrlin Safety")
                .setCapabilities(PhoneAccount.CAPABILITY_SELF_MANAGED)
                .build();
        telecomManager.registerPhoneAccount(account);
    }

    // Launched (or resumed, if already running) via CallConnection.launchMainActivity() after
    // the user taps Answer - handed to CallBridgePlugin so the JS side can join the WebRTC call
    // the same way it would from a live STOMP CALL_INCOMING push, just triggered natively instead.
    private void handleCallIntent(Intent intent, boolean appAlreadyRunning) {
        if (intent == null || !intent.getBooleanExtra("qrlin_call_answered", false)) {
            return;
        }

        Bundle extras = new Bundle();
        extras.putString("sessionToken", intent.getStringExtra("sessionToken"));
        extras.putString("tagName", intent.getStringExtra("tagName"));
        extras.putString("qrCode", intent.getStringExtra("qrCode"));
        extras.putString("iceServers", intent.getStringExtra("iceServers"));

        if (appAlreadyRunning) {
            CallBridgePlugin plugin = (CallBridgePlugin) getBridge().getPlugin("CallBridge").getInstance();
            plugin.notifyCallAnswered(extras);
        } else {
            // WebView/JS isn't ready yet on a cold start - CallBridgePlugin.checkPendingCall()
            // picks this up once the app has mounted and asks.
            CallBridgePlugin.pendingCallExtras = extras;
        }
    }
}
