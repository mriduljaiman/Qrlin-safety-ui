package in.qrlin.safety;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.telecom.Connection;
import android.telecom.DisconnectCause;
import android.telecom.TelecomManager;

/**
 * One ringing/active call, backed by the Telecom framework - this is what gets the OS to treat
 * it as a real call (lock-screen bypass, DND-for-calls handling, Bluetooth answer button,
 * native ringtone/vibration), not just an app-drawn dialog.
 */
public class CallConnection extends Connection {

    private final Context context;
    private final String sessionToken;
    private final String tagName;
    private final String qrCode;
    private final String iceServers;

    public CallConnection(Context context, String sessionToken, String tagName, String qrCode, String iceServers) {
        this.context = context.getApplicationContext();
        this.sessionToken = sessionToken;
        this.tagName = tagName;
        this.qrCode = qrCode;
        this.iceServers = iceServers;

        setConnectionProperties(PROPERTY_SELF_MANAGED);
        setAudioModeIsVoip(true);
        setCallerDisplayName(
                "Someone who scanned " + (tagName == null || tagName.isEmpty() ? "your tag" : tagName),
                TelecomManager.PRESENTATION_ALLOWED);
        setAddress(Uri.fromParts("tel", sessionToken, null), TelecomManager.PRESENTATION_ALLOWED);
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public String getTagName() {
        return tagName;
    }

    public String getQrCode() {
        return qrCode;
    }

    public String getIceServers() {
        return iceServers;
    }

    @Override
    public void onShowIncomingCallUi() {
        // Telecom calling this is our cue to show *something* - a self-managed ConnectionService
        // gets no UI for free. Posting a notification (CallStyle on 31+, a plain full-screen-intent
        // one below that) rather than calling startActivity() directly here: Android's background-
        // activity-launch restrictions can silently drop a raw startActivity() from a non-foreground
        // context like this one, whereas a full-screen-intent notification is one of the sanctioned
        // ways to reliably launch full-screen even from the background/locked screen.
        IncomingCallNotifier.notify(context, sessionToken, tagName, qrCode, iceServers);
    }

    // Called both by the Telecom framework (Bluetooth/headset answer button, Android Auto, etc.)
    // and directly by IncomingCallActivity when the user taps Answer in our own UI - both paths
    // funnel through here so the connection's state stays consistent either way.
    @Override
    public void onAnswer() {
        setActive();
        IncomingCallNotifier.cancel(context, sessionToken);
        launchMainActivity();
    }

    public void launchMainActivity() {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("qrlin_call_answered", true);
        intent.putExtra("sessionToken", sessionToken);
        intent.putExtra("tagName", tagName);
        intent.putExtra("qrCode", qrCode);
        intent.putExtra("iceServers", iceServers);
        context.startActivity(intent);
    }

    @Override
    public void onReject() {
        // Not reporting MISSED to the backend from here - the server-side ring-timeout sweep
        // (CallService.sweepStaleRingingSessions) already marks an unanswered RINGING session
        // MISSED on its own; keeping this path free of a network call keeps the native surface
        // small and avoids a duplicate/racing status update against whatever the finder's own
        // client eventually reports.
        IncomingCallNotifier.cancel(context, sessionToken);
        setDisconnected(new DisconnectCause(DisconnectCause.REJECTED));
        destroy();
        MyConnectionService.forget(sessionToken);
    }

    @Override
    public void onDisconnect() {
        IncomingCallNotifier.cancel(context, sessionToken);
        setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));
        destroy();
        MyConnectionService.forget(sessionToken);
    }
}
