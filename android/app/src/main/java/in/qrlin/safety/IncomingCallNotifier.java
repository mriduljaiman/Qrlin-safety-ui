package in.qrlin.safety;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.Person;

/**
 * Builds the actual incoming-call UI a self-managed ConnectionService has to supply itself -
 * Notification.CallStyle on Android 12+ (full-bleed incoming-call look, avatar, swipe answer/
 * decline), a plain high-priority notification with a full-screen intent on 8-11 (no CallStyle
 * API yet, but setFullScreenIntent still reliably wakes the lock screen).
 */
final class IncomingCallNotifier {

    private static final String CHANNEL_ID = "qrlin_incoming_calls";
    private static final String ACTION_ANSWER = "in.qrlin.safety.action.ANSWER_CALL";
    private static final String ACTION_DECLINE = "in.qrlin.safety.action.DECLINE_CALL";

    private IncomingCallNotifier() {}

    static void notify(Context context, String sessionToken, String tagName, String qrCode, String iceServers) {
        ensureChannel(context);

        String callerName = "Someone who scanned " + (tagName == null || tagName.isEmpty() ? "your tag" : tagName);
        int notificationId = sessionToken.hashCode();

        Intent fullScreenIntent = new Intent(context, IncomingCallActivity.class);
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        fullScreenIntent.putExtra("sessionToken", sessionToken);
        fullScreenIntent.putExtra("tagName", tagName);
        fullScreenIntent.putExtra("qrCode", qrCode);
        fullScreenIntent.putExtra("iceServers", iceServers);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context, notificationId, fullScreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        PendingIntent answerPendingIntent = actionPendingIntent(context, ACTION_ANSWER, sessionToken, notificationId);
        PendingIntent declinePendingIntent = actionPendingIntent(context, ACTION_DECLINE, sessionToken, notificationId);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setContentIntent(fullScreenPendingIntent)
                .setOngoing(true)
                .setAutoCancel(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Person caller = new Person.Builder().setName(callerName).build();
            builder.setStyle(NotificationCompat.CallStyle.forIncomingCall(caller, declinePendingIntent, answerPendingIntent));
        } else {
            builder.setContentTitle(callerName)
                    .setContentText("Incoming call - Qrlin Safety")
                    .addAction(0, "Decline", declinePendingIntent)
                    .addAction(0, "Answer", answerPendingIntent);
        }

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        manager.notify(notificationId, builder.build());
    }

    static void cancel(Context context, String sessionToken) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        manager.cancel(sessionToken.hashCode());
    }

    private static PendingIntent actionPendingIntent(Context context, String action, String sessionToken, int requestCodeBase) {
        Intent intent = new Intent(context, IncomingCallActionReceiver.class);
        intent.setAction(action);
        intent.putExtra("sessionToken", sessionToken);
        int requestCode = requestCodeBase + (ACTION_ANSWER.equals(action) ? 1 : 2);
        return PendingIntent.getBroadcast(
                context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "Incoming calls", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Calls from people who scanned one of your Qrlin Safety tags");
        channel.enableVibration(true);
        manager.createNotificationChannel(channel);
    }

    static String getAnswerAction() {
        return ACTION_ANSWER;
    }

    static String getDeclineAction() {
        return ACTION_DECLINE;
    }
}
