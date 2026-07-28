import React, { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../api/chat';
import { ChatThread } from '../types/tag';
import VoiceMessageBubble from './VoiceMessageBubble';
import VoiceRecorderButton from './VoiceRecorderButton';
import styles from '../pages/Tags.module.css';

interface ChatPanelProps {
  tagId: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ tagId }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadThreads = async () => {
    try {
      const data = await chatAPI.listThreads(tagId);
      setThreads(data);
      if (!activeThreadId && data.length > 0) {
        setActiveThreadId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat threads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    pollRef.current = setInterval(loadThreads, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !reply.trim()) return;
    setSending(true);
    try {
      const updated = await chatAPI.reply(tagId, activeThreadId, reply.trim());
      setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setReply('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendVoiceNote = async (blob: Blob, durationSeconds: number) => {
    if (!activeThreadId) return;
    const audioUrl = await chatAPI.uploadVoiceNote(blob);
    const updated = await chatAPI.replyVoiceNote(tagId, activeThreadId, audioUrl, durationSeconds);
    setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  if (loading) return null;

  return (
    <div className={styles.detailCard} style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>Messages</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
        Anonymous conversations from people who scanned this tag. They never see your real number.
      </p>

      {threads.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No messages yet.</p>
      ) : (
        <div className={styles.chatGrid}>
          <div className={styles.threadList}>
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: t.id === activeThreadId ? 'var(--primary)' : 'var(--gray-50)',
                  color: t.id === activeThreadId ? 'white' : 'var(--gray-700)',
                  fontSize: 13,
                }}
              >
                Finder {threads.indexOf(t) + 1}
                <div style={{ fontSize: 11, opacity: 0.8 }}>
                  {new Date(t.lastMessageAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          <div>
            <div
              style={{
                background: 'var(--gray-50)',
                borderRadius: 8,
                padding: 12,
                maxHeight: 260,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {activeThread?.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.senderRole === 'OWNER' ? 'flex-end' : 'flex-start',
                    background: m.senderRole === 'OWNER' ? 'var(--primary)' : 'var(--surface)',
                    color: m.senderRole === 'OWNER' ? 'white' : 'var(--gray-800)',
                    padding: '8px 12px',
                    borderRadius: 12,
                    maxWidth: '80%',
                    fontSize: 14,
                  }}
                >
                  {m.messageType === 'VOICE_NOTE' && m.audioUrl ? (
                    <VoiceMessageBubble audioUrl={m.audioUrl} durationSeconds={m.audioDurationSeconds} />
                  ) : (
                    m.body
                  )}
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                    {new Date(m.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply..."
                style={{ flex: 1, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
              />
              <VoiceRecorderButton onSend={handleSendVoiceNote} />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className={styles.addButton}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
