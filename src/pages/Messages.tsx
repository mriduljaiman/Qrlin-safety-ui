import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import { tagsAPI } from '../api/tags';
import { chatAPI } from '../api/chat';
import { ChatThread } from '../types/tag';
import styles from './Tags.module.css';

interface ThreadWithTag {
  tagId: number;
  tagName: string;
  thread: ChatThread;
}

const Messages: React.FC = () => {
  const [items, setItems] = useState<ThreadWithTag[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAll = async () => {
    try {
      const tags = await tagsAPI.listAll();
      const perTag = await Promise.all(
        tags.map(async (tag) => {
          try {
            const threads = await chatAPI.listThreads(tag.id);
            return threads.map((thread) => ({ tagId: tag.id, tagName: tag.tagName, thread }));
          } catch {
            return [];
          }
        })
      );
      const flattened = perTag.flat().sort(
        (a, b) => new Date(b.thread.lastMessageAt).getTime() - new Date(a.thread.lastMessageAt).getTime()
      );
      setItems(flattened);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    pollRef.current = setInterval(loadAll, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeItem = items.find((i) => `${i.tagId}-${i.thread.id}` === activeKey) || items[0] || null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !reply.trim()) return;
    setSending(true);
    try {
      const updated = await chatAPI.reply(activeItem.tagId, activeItem.thread.id, reply.trim());
      setItems((prev) =>
        prev.map((i) => (i.tagId === activeItem.tagId && i.thread.id === updated.id ? { ...i, thread: updated } : i))
      );
      setReply('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <Loading fullScreen />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Messages</h1>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No messages yet</h2>
            <p>Anonymous conversations from people who scan your tags will show up here.</p>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' }}>
                {items.map((item) => {
                  const key = `${item.tagId}-${item.thread.id}`;
                  const isActive = activeItem && key === `${activeItem.tagId}-${activeItem.thread.id}`;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveKey(key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? 'var(--primary)' : 'var(--gray-50)',
                        color: isActive ? 'white' : 'var(--gray-700)',
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.tagName}</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        {new Date(item.thread.lastMessageAt).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <div
                  style={{
                    background: 'var(--gray-50)',
                    borderRadius: 8,
                    padding: 12,
                    maxHeight: 400,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {activeItem?.thread.messages.map((m) => (
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
                      {m.body}
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                        {new Date(m.sentAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    style={{ flex: 1, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
