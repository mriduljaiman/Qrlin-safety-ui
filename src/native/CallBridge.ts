import { registerPlugin } from '@capacitor/core';

export interface PendingCallData {
  sessionToken: string | null;
  tagName?: string;
  qrCode?: string;
  iceServers?: string;
}

export interface CallBridgePlugin {
  getCurrentToken(): Promise<{ token: string | null }>;
  checkPendingCall(): Promise<PendingCallData>;
  addListener(
    eventName: 'callAnswered',
    listenerFunc: (data: PendingCallData) => void
  ): Promise<{ remove: () => void }>;
}

// Native counterpart: android/app/src/main/java/in/qrlin/safety/CallBridgePlugin.java
export const CallBridge = registerPlugin<CallBridgePlugin>('CallBridge');
