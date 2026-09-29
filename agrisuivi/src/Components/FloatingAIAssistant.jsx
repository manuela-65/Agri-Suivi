import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaRedo,
  FaLightbulb
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";
import "./FloatingAIAssistant.css";

export default function FloatingAIAssistant() {
  const { user, tenant, settings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre conseiller IA AgriSuivi. Posez-moi vos questions sur vos finances, stocks, parcelles ou activités en direct."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Accessible only for PROPRIETAIRE
  if (user?.role !== "PROPRIETAIRE") {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const newMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payload = { message: text };
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const res = await apiFetch("/assistant/chat/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.message }
      ]);
    } catch (error) {
      console.error("Erreur IA:", error);
      const errorMsg =
        error.message ||
        "Désolé, impossible de communiquer avec l'assistant actuellement.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg }
      ]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Nouvelle conversation démarrée. En quoi puis-je vous assister aujourd'hui ?"
      }
    ]);
    setConversationId(null);
  };

  const suggestions = [
    { label: "Solde ce mois ?", query: "Quel est mon solde net ce mois-ci ?" },
    { label: "Alertes stock ?", query: "Quels sont les articles en alerte de stock ?" },
    { label: "Cultures actives ?", query: "Fais-moi un récapitulatif des cultures actives." }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        className={`floating-ai-fab ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        title="Assistant IA AgriSuivi"
        aria-label="Assistant IA AgriSuivi"
      >
        <div className="fab-icon-wrapper">
          <FaRobot className="fab-robot-icon" />
          <span className="fab-pulse-dot" />
        </div>
        <span className="fab-label">Assistant IA</span>
      </motion.button>

      {/* Slide-in Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="floating-ai-drawer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-left">
                <div className="ai-status-avatar">
                  <FaRobot />
                  <span className="online-indicator" />
                </div>
                <div className="ai-header-titles">
                  <h4>Assistant AgriSuivi</h4>
                  <span className="ai-context-tag">
                    {settings?.nom || tenant || "Exploitation"}
                  </span>
                </div>
              </div>

              <div className="drawer-header-actions">
                <button
                  className="header-tool-btn"
                  onClick={resetChat}
                  title="Nouvelle conversation"
                >
                  <FaRedo />
                </button>
                <button
                  className="header-tool-btn"
                  onClick={() => setIsOpen(false)}
                  title="Fermer"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="ai-suggestions-bar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSendMessage(s.query)}
                  disabled={isLoading}
                >
                  <FaLightbulb className="chip-icon" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Container */}
            <div className="drawer-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-bubble-row ${msg.role}`}
                >
                  {msg.role === "assistant" && (
                    <div className="chat-avatar assistant">
                      <FaRobot />
                    </div>
                  )}

                  <div className="chat-bubble">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="chat-bubble-row assistant">
                  <div className="chat-avatar assistant">
                    <FaRobot />
                  </div>
                  <div className="chat-bubble typing-bubble">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="drawer-input-area">
              <div className="drawer-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Posez une question sur votre exploitation..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  className="drawer-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  title="Envoyer"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
