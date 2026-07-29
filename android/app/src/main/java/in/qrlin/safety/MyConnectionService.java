package in.qrlin.safety;

import android.telecom.Connection;
import android.telecom.ConnectionRequest;
import android.telecom.ConnectionService;
import android.telecom.DisconnectCause;
import android.telecom.PhoneAccountHandle;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registered once (see MainActivity) as a self-managed PhoneAccount - this is what makes an
 * incoming call from CallFirebaseMessagingService a real Telecom-managed call (lock-screen
 * ringing, native ringtone, Bluetooth/headset answer support) rather than just an app
 * notification. Tracks live connections by sessionToken so a later CALL_CANCELLED push (finder
 * gave up before the owner answered) or the app itself can end the right one.
 */
public class MyConnectionService extends ConnectionService {

    public static final String ACCOUNT_ID = "qrlin_safety_calling";

    private static final Map<String, CallConnection> activeConnections = new ConcurrentHashMap<>();

    @Override
    public Connection onCreateIncomingConnection(PhoneAccountHandle connectionManagerPhoneAccount,
                                                  ConnectionRequest request) {
        android.os.Bundle extras = request.getExtras();
        String sessionToken = extras.getString("sessionToken");
        String tagName = extras.getString("tagName");
        String qrCode = extras.getString("qrCode");
        String iceServers = extras.getString("iceServers");

        CallConnection connection = new CallConnection(this, sessionToken, tagName, qrCode, iceServers);
        connection.setRinging();
        if (sessionToken != null) {
            activeConnections.put(sessionToken, connection);
        }
        return connection;
    }

    @Override
    public void onCreateIncomingConnectionFailed(PhoneAccountHandle connectionManagerPhoneAccount,
                                                   ConnectionRequest request) {
        // Telecom refused to add the call (e.g. another self-managed call already active on a
        // ConnectionService that doesn't support concurrent calls) - nothing to clean up since
        // no CallConnection was ever created for it.
    }

    static void endConnectionFor(String sessionToken) {
        CallConnection connection = activeConnections.get(sessionToken);
        if (connection != null) {
            connection.setDisconnected(new DisconnectCause(DisconnectCause.CANCELED));
            connection.destroy();
            activeConnections.remove(sessionToken);
        }
    }

    static void forget(String sessionToken) {
        activeConnections.remove(sessionToken);
    }

    static CallConnection get(String sessionToken) {
        return activeConnections.get(sessionToken);
    }
}
