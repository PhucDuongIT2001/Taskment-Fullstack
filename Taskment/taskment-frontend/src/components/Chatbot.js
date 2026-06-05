import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Import axios
import './Chatbot.css';

// Biểu tượng cho nút Chatbot (sử dụng SVG inline)
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessageText = inputValue;
    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = { id: Date.now(), text: userMessageText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    // Hiển thị "đang gõ..."
    const typingMessage = { id: Date.now() + 1, text: '...', sender: 'bot' };
    setMessages(prevMessages => [...prevMessages, typingMessage]);

    try {
      // Gọi API đến backend
      const response = await axios.post('http://localhost:8080/api/chatbot/send', { message: userMessageText });
      const botReply = response.data.reply;

      // Thay thế tin nhắn "đang gõ..." bằng câu trả lời thật
      setMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1); // Xóa tin nhắn "đang gõ..."
        return [...newMessages, { id: Date.now() + 2, text: botReply, sender: 'bot' }];
      });

    } catch (error) {
      console.error('Lỗi khi gọi API Chatbot:', error);
      setMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1); // Xóa tin nhắn "đang gõ..."
        return [...newMessages, { id: Date.now() + 2, text: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI.', sender: 'bot' }];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={`chatbot-toggle-button ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        <ChatIcon />
      </div>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <button onClick={toggleChat} className="close-btn">&times;</button>
          </div>
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={handleSendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
