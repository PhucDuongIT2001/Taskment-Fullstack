import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { chatService } from '../services/chatService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'model', content: 'Xin chào! Tôi là trợ lý AI của Taskment. Tôi có thể giúp gì cho dự án của bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const newUserMsg = { id: Date.now(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage, conversationId);
      
      // Update conversation ID if it's the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Add AI response to UI
      const aiMsg = { id: Date.now() + 1, role: 'model', content: response.response || response.reply || response.message || '...' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Handle error
      const errorMsg = { id: Date.now() + 1, role: 'model', content: 'Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <FiMessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '550px',
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '36px', height: '36px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiMessageSquare color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Taskment AI</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>Trợ lý ảo thông minh</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  color: 'white',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.75rem 1rem',
                borderRadius: '16px 16px 16px 0',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiLoader className="spin" /> <span>Đang suy nghĩ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI về dự án của bạn..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.6 : 1
              }}
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
};

export default Chatbot;
