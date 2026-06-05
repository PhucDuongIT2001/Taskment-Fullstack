import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, X, Maximize2, Minimize2, Trash2, User as UserIcon } from 'lucide-react';
import useAuth from '../useAuth'; // Get token
import api from '../services/api';

const ChatWidget = () => {
    const { currentUser } = useAuth();
    const token = localStorage.getItem("token");
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Mình là AI Assistant. Bạn cần giúp gì?", isBot: true, id: Date.now() }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const [conversationId, setConversationId] = useState(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);
    const toggleExpand = () => setIsExpanded(!isExpanded);
    
    const clearChat = () => {
        setMessages([{ text: "Chào bạn! Mình là AI Assistant. Bạn cần giúp gì?", isBot: true, id: Date.now() }]);
        setConversationId(null);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Lấy lịch sử chat khi mở widget
    useEffect(() => {
        if (isOpen && token && messages.length === 1 && !conversationId) {
            loadRecentHistory();
        }
    }, [isOpen, token]);

    const loadRecentHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // Lấy danh sách conversation
            const convRes = await api.get('/chat/conversations');
            if (convRes.data && convRes.data.length > 0) {
                const latestConvId = convRes.data[0].id;
                setConversationId(latestConvId);
                // Lấy messages của conversation này
                const msgRes = await api.get(`/chat/conversations/${latestConvId}/messages`);
                if (msgRes.data && msgRes.data.length > 0) {
                    const loadedMessages = msgRes.data.map(m => ({
                        text: m.content,
                        isBot: m.role === 'model',
                        id: m.id
                    }));
                    setMessages(loadedMessages);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chat:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { text: input, isBot: false, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const payload = { message: userMsg.text };
            if (conversationId) {
                payload.conversationId = conversationId;
            }
            
            const response = await api.post('/chat', payload);
            
            if (response.status === 200) {
                setMessages(prev => [...prev, { text: response.data.response, isBot: true, id: Date.now() }]);
                if (!conversationId && response.data.conversationId) {
                    setConversationId(response.data.conversationId);
                }
            } else {
                setMessages(prev => [...prev, { text: "Xin lỗi, đã xảy ra lỗi từ máy chủ.", isBot: true, id: Date.now() }]);
            }
        } catch (error) {
            console.error("Error sending message to chat:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setMessages(prev => [...prev, { text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", isBot: true, id: Date.now() }]);
            } else if (error.response?.status === 503) {
                 setMessages(prev => [...prev, { text: "AI service temporarily unavailable. Please try again.", isBot: true, id: Date.now() }]);
            } else if (error.response?.status === 500) {
                 setMessages(prev => [...prev, { text: "Lỗi hệ thống nội bộ (500). Vui lòng thử lại sau.", isBot: true, id: Date.now() }]);
            } else {
                setMessages(prev => [...prev, { text: `Lỗi kết nối: ${error.message}. Vui lòng kiểm tra console hoặc mạng.`, isBot: true, id: Date.now() }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Component to render Markdown properly
    const renderMarkdown = (text) => {
        return (
            <div className="prose prose-sm max-w-none !text-gray-900 prose-p:!text-gray-900 prose-headings:!text-gray-900 prose-strong:!text-gray-900">
                <ReactMarkdown
                    components={{
                        code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md my-2"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm text-pink-500" {...props}>
                                    {children}
                                </code>
                            )
                        }
                    }}
                >
                    {text}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div 
                    className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 mb-4
                    ${isExpanded ? 'w-[80vw] h-[80vh] md:w-[800px] md:h-[700px]' : 'w-[350px] h-[500px] sm:w-[400px] sm:h-[600px]'}`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Assistant</h3>
                                <p className="text-xs text-indigo-100 opacity-80">Powered by Taskment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <button onClick={clearChat} className="hover:text-white transition-colors p-1" title="Xóa lịch sử">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={toggleExpand} className="hover:text-white transition-colors p-1 hidden sm:block" title="Phóng to">
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <button onClick={toggleChat} className="hover:text-white transition-colors p-1" title="Đóng">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-gray-50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-auto mb-1">
                                        {msg.isBot ? (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Bot className="w-5 h-5 text-indigo-600" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div 
                                        className={`p-3 rounded-2xl shadow-sm text-sm
                                        ${msg.isBot 
                                            ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100' 
                                            : 'bg-indigo-600 text-white rounded-br-none'}`}
                                    >
                                        {msg.isBot ? renderMarkdown(msg.text) : <span className="whitespace-pre-wrap">{msg.text}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex max-w-[85%] gap-2 flex-row">
                                    <div className="flex-shrink-0 mt-auto mb-1">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-3 border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Hỏi AI bất kỳ điều gì..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 animate-bounce"
                >
                    <Bot className="w-7 h-7" />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
