import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const MAX_MESSAGE_LENGTH = 1000; // keep in sync with server/routes/chatRoutes.js

const PROMPT_SUGGESTIONS = [
  "What should I do if a snake bites me right now?",
  "How can I snake-proof my garden and house?",
  "How to distinguish a harmless water snake from a water moccasin?",
  "Do commercial snake repellents and mothballs actually work?"
];

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Reveals a bot reply word by word (writes straight to the DOM; no per-tick React renders).
// Reduced-motion users get the full text at once, and unmounting always leaves the full text.
function TypedText({ text, onProgress }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      return undefined;
    }

    const tokens = text.split(/(\s+)/); // words and whitespace, so spacing is preserved
    const step = Math.max(2, Math.ceil(tokens.length / 120)); // long replies reveal faster
    let shown = 0;
    el.textContent = '';

    const id = setInterval(() => {
      shown = Math.min(shown + step, tokens.length);
      el.textContent = tokens.slice(0, shown).join('');
      onProgress?.();
      if (shown >= tokens.length) clearInterval(id);
    }, 28);

    return () => {
      clearInterval(id);
      el.textContent = text;
    };
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} aria-label={text} />;
}

export default function SerpentBot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am SerpentBot, your AI Herpetologist and Snake Safety Assistant. Ask me anything about snake identification, bite first aid, venom symptoms, or home prevention tips.",
      time: timeNow(),
      greeting: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Scroll only the message list (scrollIntoView would also jump the whole page)
  const scrollToBottom = (behavior = 'smooth') => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    // Recent real exchanges (no greeting or error bubbles) give the AI context for follow-up questions
    const history = messages
      .filter((m) => !m.greeting && !m.isError)
      .slice(-6)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'bot', text: m.text }));

    setMessages(prev => [...prev, { sender: 'user', text, time: timeNow() }]);
    setInput('');
    setLoading(true);

    try {
      let res;
      try {
        res = await sendChatMessage(text, history);
      } catch (firstError) {
        // One automatic retry for transient failures (busy AI, network blip); never for 4xx
        const status = firstError?.response?.status;
        if (status && status < 500) throw firstError;
        res = await sendChatMessage(text, history);
      }
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply || "I'm sorry, I couldn't process that. Please try asking again.",
          time: timeNow(),
          typed: true
        }
      ]);
    } catch (err) {
      const rateLimited = err?.response?.status === 429;
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: rateLimited
            ? "You're sending messages quickly. Please wait a minute and try again. If this is an emergency, call 911 / 112 / 108 now."
            : `${err?.response?.data?.message || 'I encountered a connection error.'} If you are experiencing an emergency, please call 911 / 112 / 108 immediately.`,
          time: timeNow(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#fff',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
                SerpentBot AI Herpetologist
              </h2>
              <span className="badge badge-harmless" style={{ fontSize: '0.7rem' }}>
                <span className="status-dot" /> Online & Ready
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Ask anything about species identification, bite first aid, venom symptoms, or pet safety.
            </p>
          </div>
        </div>

        {/* Quick prompt pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {PROMPT_SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '999px',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Sparkles size={13} style={{ flexShrink: 0, color: '#6ee7b7' }} /> {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        borderRadius: '20px',
        height: '460px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Messages List */}
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingRight: '0.5rem'
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-msg chat-msg--${msg.sender}`}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #047857, #10b981)' : 'rgba(255, 255, 255, 0.04)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)',
                color: msg.isError ? '#f87171' : '#fff',
                padding: '0.85rem 1.15rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere'
              }}>
                {msg.typed
                  ? <TypedText text={msg.text} onProgress={() => scrollToBottom('auto')} />
                  : <div>{msg.text}</div>}
                <div style={{
                  fontSize: '0.68rem',
                  color: msg.sender === 'user' ? 'rgba(255,255,255,0.75)' : '#8aa395',
                  textAlign: 'right',
                  marginTop: '0.3rem'
                }}>
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg--bot" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>
              <div className="typing-dots" role="status" aria-label="SerpentBot is typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            display: 'flex',
            gap: '0.6rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-glass)'
          }}
        >
          <input
            type="text"
            aria-label="Message SerpentBot"
            placeholder="Ask SerpentBot about snakes, bite prevention, symptoms..."
            value={input}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.8rem 1.1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.4rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
