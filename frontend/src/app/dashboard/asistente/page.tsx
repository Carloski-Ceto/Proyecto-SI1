'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Eye } from 'lucide-react';
import api from '@/lib/api';
import styles from './page.module.css';

interface Message {
  role: 'user' | 'model';
  content: string;
}

function formatText(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ));
}

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const historial = newMessages.slice(0, -1);
      const { data } = await api.post<{ respuesta: string }>('/api/asistente/chat/', {
        mensaje: text,
        historial,
      });
      setMessages([...newMessages, { role: 'model', content: data.respuesta }]);
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Error al conectar con el asistente.');
      setMessages(newMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.botAvatar}>
            <Eye size={20} />
          </div>
          <div>
            <h1 className={styles.title}>Asistente Clínico IA</h1>
            <p className={styles.subtitle}>Especializado en oftalmología · Respuestas orientativas</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearChat} type="button">
            Nueva conversación
          </button>
        )}
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Eye size={48} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>¿En qué puedo ayudarte?</h2>
            <p className={styles.emptyDesc}>
              Consultame sobre patologías oculares, parámetros de refracción, medicamentos
              oftalmológicos, procedimientos quirúrgicos o cualquier duda clínica del área.
            </p>
            <div className={styles.suggestions}>
              {[
                '¿Qué es el glaucoma de ángulo cerrado?',
                'Explicame cómo interpretar un resultado de refracción',
                '¿Cuáles son los síntomas de urgencia de un desprendimiento de retina?',
                '¿Para qué se usa la tropicamida?',
              ].map((s) => (
                <button
                  key={s}
                  className={styles.suggestionBtn}
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
          <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}>
            <div className={styles.avatar}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={styles.bubble}>
              {formatText(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.avatar}><Bot size={16} /></div>
            <div className={`${styles.bubble} ${styles.typingBubble}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder="Escribí tu consulta oftalmológica… (Enter para enviar, Shift+Enter para nueva línea)"
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
          aria-label="Enviar mensaje"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
