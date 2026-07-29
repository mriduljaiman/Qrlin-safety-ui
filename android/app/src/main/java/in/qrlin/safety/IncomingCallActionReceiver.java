package in.qrlin.safety;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Handles the Answer/Decline actions on the incoming-call notification (IncomingCallNotifier).
 * Tapping a notification action is one of Android's sanctioned exceptions to the background-
 * activity-launch restrictions, so CallConnection.onAnswer()'s startActivity() call reliably
 * goes through even though this receiver itself has no visible UI.
 */
public class IncomingCallActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String sessionToken = intent.getStringExtra("sessionToken");
        if (sessionToken == null) return;

        CallConnection connection = MyConnectionService.get(sessionToken);
        if (connection == null) return;

        String action = intent.getAction();
        if (action == null) return;

        if (action.equals(IncomingCallNotifier.getAnswerAction())) {
            connection.onAnswer();
        } else if (action.equals(IncomingCallNotifier.getDeclineAction())) {
            connection.onReject();
        }
    }
}
