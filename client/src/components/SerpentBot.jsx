import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Volume2, VolumeX, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const PROMPT_SUGGESTIONS = [
  "What should I do if a snake bites me right now?",
  "How can I snake-proof my garden and house?",
  "How to distinguish a harmless water snake from a water moccasin?",
  "Do commercial snake repellents and mothballs actually work?"
];

export default function SerpentBot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am SerpentBot, your AI Herpetologist and Snake Safety Assistant. Ask me anything about snake identification, bite first aid, venom symptoms, or home prevention tips.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text.trim());
      const botMsg = {
        sender: 'bot',
        text: res.reply || "I'm sorry, I couldn't process that. Please try asking again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I encountered a connection error. If you are experiencing an emergency, please call 911 / 112 / 108 immediately.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            color: '#fff',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
                SerpentBot AI Herpetologist
              </h2>
              <span className="badge badge-harmless" style={{ fontSize: '0.7rem' }}>
                Online & Ready
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Ask anything about species identification, bite first aid, venom symptoms, or pet safety.
            </p>
          </div>
        </div>

        {/* Quick prompt pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {PROMPT_SUGGESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '999px',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              💡 {q}
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
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingRight: '0.5rem'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
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
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255, 255, 255, 0.04)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)',
                color: msg.isError ? '#f87171' : '#fff',
                padding: '0.85rem 1.15rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                <div>{msg.text}</div>
                <div style={{
                  fontSize: '0.68rem',
                  color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#64748b',
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
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#34d399', fontSize: '0.85rem' }}>
              <RefreshCw className="animate-spin" size={18} />
              <span>SerpentBot is formulating answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
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
            placeholder="Ask SerpentBot about snakes, bite prevention, symptoms..."
            value={input}
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
