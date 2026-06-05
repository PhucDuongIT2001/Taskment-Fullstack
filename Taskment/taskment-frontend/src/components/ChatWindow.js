import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketUrl } from '../services/api';

const ChatWindow = ({ username }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const stompClientRef = useRef(null);
    const messageAreaRef = useRef(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(getWebSocketUrl()),
            onConnect: () => {
                console.log('Connected to WebSocket!');
                stompClientRef.current = client;

                client.subscribe('/topic/public', (payload) => {
                    const chatMessage = JSON.parse(payload.body);
                    setMessages(prevMessages => [...prevMessages, chatMessage]);
                });

                client.publish({
                    destination: '/app/chat.addUser',
                    body: JSON.stringify({ sender: username, type: 'JOIN' })
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [username]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput && stompClientRef.current) {
            const chatMessage = {
                sender: username,
                content: messageInput,
                type: 'CHAT'
            };
            stompClientRef.current.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage)
            });
            setMessageInput('');
        }
    };

    return (
        <div className="chat-window card">
            <div className="chat-header">
                <h3>Phòng chat chung</h3>
            </div>
            <ul className="message-area" ref={messageAreaRef}>
                {messages.map((msg, index) => (
                    <li key={index} className={`chat-message ${msg.sender === username ? 'own-message' : ''}`}>
                        {msg.type === 'JOIN' ? (
                            <div className="event-message">{msg.sender} đã tham gia!</div>
                        ) : msg.type === 'LEAVE' ? (
                            <div className="event-message">{msg.sender} đã rời đi.</div>
                        ) : (
                            <>
                                <div className="avatar">{msg.sender.charAt(0)}</div>
                                <div className="message-content">
                                    <div className="sender-name">{msg.sender}</div>
                                    <div className="message-text">{msg.content}</div>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <form className="chat-form" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                />
                <button type="submit">Gửi</button>
            </form>
        </div>
    );
};

export default ChatWindow;
