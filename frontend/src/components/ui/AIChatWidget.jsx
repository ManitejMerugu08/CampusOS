import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import './AIChatWidget.css';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'model', content: "Hey there! 👋 I'm your Campus Assistant. Ask me anything about campus life, tickets, canteen, or academics!" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));

        try {
            const data = await api.post('/ai/chat', { message: userMsg.content, history: historyForApi });
            let replyText = data.reply;
            if (data.error) replyText = data.error;
            setMessages(prev => [...prev, { id: Date.now(), role: 'model', content: replyText }]);
        } catch (error) {
            console.error('AI error:', error);
            const errorMsg = error.response?.data?.error || "Sorry, I'm having trouble connecting right now. Please try again later.";
            setMessages(prev => [...prev, { id: Date.now(), role: 'model', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { label: "🎫 Create Ticket", msg: "How do I create a support ticket?" },
        { label: "🍔 Canteen Menu", msg: "What's on the canteen menu today?" },
        { label: "📚 Academic Help", msg: "I need help with my course schedule" },
    ];

    const handleQuickAction = (msg) => {
        setInputValue(msg);
        setTimeout(() => handleSend(), 0);
        setInputValue('');
        const userMsg = { id: Date.now(), role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
        api.post('/ai/chat', { message: msg, history: historyForApi })
            .then(data => {
                let replyText = data.reply;
                if (data.error) replyText = data.error;
                setMessages(prev => [...prev, { id: Date.now(), role: 'model', content: replyText }]);
            })
            .catch(error => {
                const errorMsg = error.response?.data?.error || "Sorry, I'm having trouble connecting right now.";
                setMessages(prev => [...prev, { id: Date.now(), role: 'model', content: errorMsg }]);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <>
            {/* Floating Avatar Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="chat-fab"
                        title="Campus AI Assistant"
                    >
                        <img src={`${import.meta.env.BASE_URL}chatbot-avatar.png`} alt="AI Assistant" className="chat-fab-avatar" />
                        <span className="chat-fab-pulse"></span>
                        <span className="chat-fab-pulse chat-fab-pulse-delay"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="chat-card"
                    >
                        {/* Header */}
                        <div className="chat-card-header">
                            <div className="chat-card-header-left">
                                <div className="chat-card-avatar-ring">
                                    <img src={`${import.meta.env.BASE_URL}chatbot-avatar.png`} alt="AI" className="chat-card-avatar" />
                                </div>
                                <div>
                                    <div className="chat-card-title">Campus Assistant</div>
                                    <div className="chat-card-subtitle">
                                        <span className="chat-card-status-dot"></span>
                                        Always online
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="chat-card-close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-card-messages">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}
                                >
                                    {msg.role !== 'user' && (
                                        <div className="chat-msg-bot-icon">
                                            <Bot size={14} />
                                        </div>
                                    )}
                                    <div className={`chat-msg-bubble ${msg.role === 'user' ? 'chat-msg-bubble-user' : 'chat-msg-bubble-bot'}`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="chat-msg-user-icon">
                                            <User size={14} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="chat-msg chat-msg-bot"
                                >
                                    <div className="chat-msg-bot-icon">
                                        <Bot size={14} />
                                    </div>
                                    <div className="chat-msg-bubble chat-msg-bubble-bot chat-typing">
                                        <span className="chat-typing-dot"></span>
                                        <span className="chat-typing-dot"></span>
                                        <span className="chat-typing-dot"></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 1 && !isLoading && (
                            <div className="chat-card-quick">
                                {quickActions.map((qa, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickAction(qa.msg)}
                                        className="chat-card-quick-btn"
                                    >
                                        {qa.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="chat-card-input">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="chat-card-input-field"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="chat-card-send"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatWidget;
