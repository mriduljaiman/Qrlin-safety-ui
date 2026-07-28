import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicScanAPI } from '../api/tags';
import { chatAPI } from '../api/chat';
import { callAPI } from '../api/calls';
import { useGeolocation } from '../hooks/useGeolocation';
import { PublicTag, ChatMessage, IceServer } from '../types/tag';
import VoiceMessageBubble from '../components/VoiceMessageBubble';
import VoiceRecorderButton from '../components/VoiceRecorderButton';
import CallModal from '../components/CallModal';
import SosButton from '../components/SosButton';
import styles from './PublicScan.module.css';

const PublicScan: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [tag, setTag] = useState<PublicTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const location = useGeolocation();

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const sessionTokenRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeCall, setActiveCall] = useState<{ sessionToken: string; iceServers: IceServer[] } | null>(null);
  const [callStarting, setCallStarting] = useState(false);

  useEffect(() => {
    // Wait for geolocation to actually settle (got coordinates, got denied, or
    // timed out - useGeolocation caps this at 5s) before firing the scan. Firing
    // immediately on mount meant the request almost always went out with no
    // coordinates yet, regardless of whether the finder granted permission.
    if (!code || location.loading) return;
    (async () => {
      try {
        const data = await publicScanAPI.scan(code, location.latitude || undefined, location.longitude || undefined);
        setTag(data);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [code, location.loading, location.latitude, location.longitude]);

  useEffect(() => {
    if (!code) return;
    sessionTokenRef.current = localStorage.getItem(`chat_token_${code}`);
  }, [code]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollMessages = async () => {
    if (!code || !sessionTokenRef.current) return;
    try {
      const thread = await chatAPI.getPublicThread(code, sessionTokenRef.current);
      setMessages(thread.messages);
    } catch {
      // Thread may not exist yet - ignore until the first send.
    }
  };

  const openChat = () => {
    setChatOpen(true);
    if (sessionTokenRef.current) {
      pollMessages();
    }
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(pollMessages, 5000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !chatInput.trim()) return;
    setSendingChat(true);
    try {
      const thread = await chatAPI.sendPublicMessage(code, chatInput.trim(), sessionTokenRef.current || undefined);
      setMessages(thread.messages);
      if (thread.sessionToken) {
        sessionTokenRef.current = thread.sessionToken;
        localStorage.setItem(`chat_token_${code}`, thread.sessionToken);
      }
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleSendVoiceNote = async (blob: Blob, durationSeconds: number) => {
    if (!code) return;
    const audioUrl = await chatAPI.uploadVoiceNote(blob);
    const thread = await chatAPI.sendPublicVoiceNote(code, audioUrl, durationSeconds, sessionTokenRef.current || undefined);
    setMessages(thread.messages);
    if (thread.sessionToken) {
      sessionTokenRef.current = thread.sessionToken;
      localStorage.setItem(`chat_token_${code}`, thread.sessionToken);
    }
  };

  const handleStartCall = async () => {
    if (!code) return;
    setCallStarting(true);
    try {
      const { sessionToken, iceServers } = await callAPI.initiate(code);
      setActiveCall({ sessionToken, iceServers });
    } catch (err) {
      console.error('Failed to start call', err);
    } finally {
      setCallStarting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.publicContainer}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (notFound || !tag) {
    return (
      <div className={styles.publicContainer}>
        <p className={styles.error}>This tag isn't active or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className={styles.publicContainer}>
      {tag.lostMode && (
        <motion.div
          className={styles.lostBanner}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          This item has been reported lost
        </motion.div>
      )}

      <div className={styles.profileCard}>
        {tag.photoUrl && <img src={tag.photoUrl} alt={tag.tagName} className={styles.profileImage} />}

        <span className={styles.categoryBadge}>{tag.category}</span>
        <h1 className={styles.tagName}>{tag.tagName}</h1>

        {tag.description && <p className={styles.description}>{tag.description}</p>}

        {tag.publicMessage && (
          <div className={styles.publicMessage}>{tag.publicMessage}</div>
        )}

        <div className={styles.contactSection}>
          {tag.contactName && <p className={styles.maskedContact}><strong>{tag.contactName}</strong></p>}
          {tag.contactPhone && (
            <p className={styles.maskedContact}>
              📞 <a href={`tel:${tag.contactPhone}`} style={{ color: 'inherit' }}>{tag.contactPhone}</a>
            </p>
          )}
          {tag.whatsappNumber && (
            <p className={styles.maskedContact}>
              <a
                href={`https://wa.me/${tag.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}
              >
                💬 Message on WhatsApp
              </a>
            </p>
          )}
          {tag.address && <p className={styles.maskedContact}>📍 {tag.address}</p>}

          {tag.customFields && tag.customFields.length > 0 && (
            <div style={{ marginTop: 8, textAlign: 'left' }}>
              {tag.customFields.map((field, i) => (
                <p key={i} className={styles.maskedContact} style={{ margin: '4px 0' }}>
                  <strong>{field.label}:</strong> {field.value}
                </p>
              ))}
            </div>
          )}

          {!tag.contactPhone && !tag.address && !tag.whatsappNumber && (
            tag.maskedContact ? (
              <p className={styles.maskedContact}>Owner contact: {tag.maskedContact}</p>
            ) : (
              <p className={styles.maskedContact}>No contact info shared for this tag.</p>
            )
          )}

          {!chatOpen ? (
            <button
              onClick={openChat}
              style={{
                marginTop: 12, padding: '10px 20px', background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
              }}
            >
              💬 Message Owner (free, anonymous)
            </button>
          ) : (
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <div
                style={{
                  background: '#f7fafc', borderRadius: 8, padding: 10, maxHeight: 200,
                  overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                {messages.length === 0 && (
                  <p style={{ fontSize: 13, color: '#a0aec0', margin: 0 }}>
                    Send a message — the owner will be notified right away. Your identity is never shared.
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.senderRole === 'FINDER' ? 'flex-end' : 'flex-start',
                      background: m.senderRole === 'FINDER' ? 'var(--primary)' : 'white',
                      color: m.senderRole === 'FINDER' ? 'white' : '#1a202c',
                      padding: '8px 12px', borderRadius: 12, maxWidth: '85%', fontSize: 14,
                    }}
                  >
                    {m.messageType === 'VOICE_NOTE' && m.audioUrl ? (
                      <VoiceMessageBubble audioUrl={m.audioUrl} durationSeconds={m.audioDurationSeconds} />
                    ) : (
                      m.body
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8 }}
                />
                <VoiceRecorderButton onSend={handleSendVoiceNote} />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  Send
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <button
              onClick={handleStartCall}
              disabled={callStarting}
              style={{
                padding: '10px 20px', background: '#38a169', color: 'white',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%',
              }}
            >
              📞 {callStarting ? 'Calling...' : 'Call Owner (free)'}
            </button>
            {code && <SosButton code={code} lat={location.latitude || undefined} lng={location.longitude || undefined} />}
          </div>
        </div>
      </div>

      {activeCall && code && (
        <CallModal
          code={code}
          sessionToken={activeCall.sessionToken}
          iceServers={activeCall.iceServers}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};

export default PublicScan;
