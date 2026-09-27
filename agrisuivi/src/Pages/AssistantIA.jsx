import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaPaperPlane, FaSeedling, FaMoneyBillWave, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiFetch } from '../api/apiClient';
import './AssistantIA.css';

export default function AssistantIA() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Bonjour ! Je suis votre assistant intelligent AgriSuivi. Je peux vous aider à analyser vos finances, surveiller vos stocks, ou vous faire un résumé de l'état actuel de votre exploitation. Comment puis-je vous aider aujourd'hui ?"
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const newMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const payload = { message: text };
            if (conversationId) {
                payload.conversation_id = conversationId;
            }

            const res = await apiFetch('/assistant/chat/', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (res.conversation_id) {
                setConversationId(res.conversation_id);
            }
            
            setMessages(prev => [...prev, { role: 'assistant', content: res.message }]);
        } catch (error) {
            console.error("Erreur IA:", error);
            const errorMsg = error.message || "Désolé, une erreur de communication est survenue avec l'IA. Veuillez réessayer.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { icon: <FaMoneyBillWave />, text: "Combien ai-je dépensé ce mois-ci ?" },
        { icon: <FaBoxOpen />, text: "Quels sont mes stocks en alerte ?" },
        { icon: <FaSeedling />, text: "Quelles sont mes cultures actives ?" },
        { icon: <FaChartLine />, text: "Résume l'état de mon exploitation." },
    ];

    return (
        <motion.div 
            className="assistant-ia-page"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="assistant-header">
                <div className="assistant-avatar-large">
                    <FaRobot />
                </div>
                <div className="assistant-header-info">
                    <h1>Assistant AgriSuivi</h1>
                    <p>Votre IA dédiée à la gestion de l'exploitation</p>
                </div>
            </div>

            <div className="assistant-messages">
                {messages.map((msg, index) => (
                    <motion.div 
                        key={index} 
                        className={`message-wrapper ${msg.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? <FaRobot /> : <FaUser />}
                        </div>
                        <div className="message-bubble">
                            {/* Simple text formatting, you can use react-markdown if needed later */}
                            {msg.content.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i !== msg.content.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div 
                        className="message-wrapper assistant"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="message-avatar"><FaRobot /></div>
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </motion.div>
                )}

                {messages.length === 1 && !isLoading && (
                    <motion.div 
                        className="suggestions-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {suggestions.map((s, idx) => (
                            <button 
                                key={idx} 
                                className="suggestion-chip"
                                onClick={() => handleSendMessage(s.text)}
                            >
                                {s.icon} {s.text}
                            </button>
                        ))}
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="assistant-input-area">
                <form 
                    className="input-form" 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage(inputValue);
                    }}
                >
                    <input 
                        type="text" 
                        placeholder="Posez une question sur votre exploitation..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn-send" disabled={!inputValue.trim() || isLoading}>
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
