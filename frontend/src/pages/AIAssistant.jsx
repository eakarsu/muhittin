import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const suggestedPrompts = [
  'How can I get more customers for my dental practice?',
  'What are the best marketing strategies for a local plumber?',
  'How should I respond to negative reviews?',
  'What social media content works best for salons?',
  'How do I build an effective referral program?',
  'What email campaigns drive the most bookings?',
  'How can I improve my Google Business ranking?',
  'What pricing strategies work for personal trainers?'
];

export default function AIAssistant() {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const question = text || input;
    if (!question.trim()) return;

    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question, context: 'The user runs a local business and needs practical growth advice.' })
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  return (
    <div>
      <div className="page-header">
        <div><h1>AI Assistant</h1><p className="subtitle">Get AI-powered business growth advice</p></div>
      </div>

      <div className="ai-chat">
        {messages.length === 0 && (
          <>
            <div className="card" style={{ textAlign: 'center', padding: 30, marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Welcome to AI Business Assistant</h3>
              <p style={{ fontSize: 13, color: '#666' }}>Ask me anything about growing your local business. I can help with marketing, customer acquisition, pricing, and more.</p>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Suggested prompts:</p>
            <div className="suggested-prompts">
              {suggestedPrompts.map(p => (
                <button key={p} onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          </>
        )}

        {messages.length > 0 && (
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <div className="bubble">
                  {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="bubble"><div className="spinner" style={{ width: 16, height: 16 }}></div> Thinking...</div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-input">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about business growth..." disabled={loading} />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}
