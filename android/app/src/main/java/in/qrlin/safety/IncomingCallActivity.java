package in.qrlin.safety;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Full-screen incoming-call UI, launched via the notification's full-screen intent
 * (IncomingCallNotifier) when the device is locked or the notification itself is tapped. Built
 * as a plain Activity (not the Capacitor WebView) so it shows instantly without waiting on the
 * JS bundle - actually joining the WebRTC call only happens after Answer, inside MainActivity.
 */
public class IncomingCallActivity extends Activity {

    private String sessionToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                            | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }

        sessionToken = getIntent().getStringExtra("sessionToken");
        String tagName = getIntent().getStringExtra("tagName");
        if (sessionToken == null) {
            finish();
            return;
        }

        setContentView(buildLayout(tagName));
    }

    private LinearLayout buildLayout(String tagName) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#1a202c"));
        int pad = dp(24);
        root.setPadding(pad, pad, pad, pad);

        TextView icon = new TextView(this);
        icon.setText("☎️");
        icon.setTextSize(56);
        icon.setGravity(Gravity.CENTER);

        TextView title = new TextView(this);
        title.setText("Someone who scanned " + (tagName == null || tagName.isEmpty() ? "your tag" : tagName) + " is calling");
        title.setTextColor(Color.WHITE);
        title.setTextSize(20);
        title.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        titleParams.topMargin = dp(24);
        titleParams.bottomMargin = dp(48);

        LinearLayout buttonRow = new LinearLayout(this);
        buttonRow.setOrientation(LinearLayout.HORIZONTAL);
        buttonRow.setGravity(Gravity.CENTER);

        Button decline = new Button(this);
        decline.setText("Decline");
        decline.setBackgroundColor(Color.parseColor("#e53e3e"));
        decline.setTextColor(Color.WHITE);
        decline.setOnClickListener(v -> {
            CallConnection connection = MyConnectionService.get(sessionToken);
            if (connection != null) connection.onReject();
            finish();
        });

        Button answer = new Button(this);
        answer.setText("Answer");
        answer.setBackgroundColor(Color.parseColor("#38a169"));
        answer.setTextColor(Color.WHITE);
        answer.setOnClickListener(v -> {
            CallConnection connection = MyConnectionService.get(sessionToken);
            if (connection != null) connection.onAnswer();
            finish();
        });

        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        buttonParams.leftMargin = dp(16);
        buttonParams.rightMargin = dp(16);
        buttonRow.addView(decline, buttonParams);
        buttonRow.addView(answer, buttonParams);

        root.addView(icon);
        root.addView(title, titleParams);
        root.addView(buttonRow);
        return root;
    }

    private int dp(int value) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(value * density);
    }
}
