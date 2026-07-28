import React from 'react';

interface VoiceMessageBubbleProps {
  audioUrl: string;
  durationSeconds: number | null;
}

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({ audioUrl, durationSeconds }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
    <audio controls src={audioUrl} style={{ height: 32, width: '100%' }} />
    {durationSeconds != null && (
      <span style={{ fontSize: 11, opacity: 0.8 }}>{durationSeconds}s voice note</span>
    )}
  </div>
);

export default VoiceMessageBubble;
