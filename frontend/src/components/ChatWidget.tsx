'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Eye, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import styles from './ChatWidget.module.css';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post<{ respuesta: string }>('/api/asistente/chat/', {
        mensaje: text,
        historial: newMessages.slice(0, -1),
      });
      setMessages([...newMessages, { role: 'model', content: data.respuesta }]);
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Error al conectar con el asistente.');
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerAvatar}><Eye size={16} /></div>
              <div>
                <p className={styles.headerTitle}>Asistente Clínico IA</p>
                <p className={styles.headerSub}>Oftalmología · Orientativo</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              {messages.length > 0 && (
                <button
                  className={styles.iconBtn}
                  onClick={() => { setMessages([]); setError(null); }}
                  title="Limpiar conversación"
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button className={styles.iconBtn} onClick={() => setOpen(false)} title="Cerrar" type="button">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && !loading && (
              <div className={styles.empty}>
                <Eye size={32} className={styles.emptyIcon} />
                <p className={styles.emptyText}>Consultame sobre patologías, medicamentos, procedimientos o parámetros oftalmológicos.</p>
                <div className={styles.chips}>
                  {['¿Qué es el glaucoma?', 'Interpretar refracción', 'Urgencias oculares', '¿Para qué sirve la tropicamida?'].map((s) => (
                    <button
                      key={s}
                      className={styles.chip}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={styles.avatar}>
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.msg} ${styles.botMsg}`}>
                <div className={styles.avatar}><Bot size={12} /></div>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Escribí tu consulta… (Enter para enviar)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              type="button"
              aria-label="Enviar"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Asistente oftalmológico"
        type="button"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
    </>
  );
}
