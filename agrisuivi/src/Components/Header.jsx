import React, { useState } from "react";
import { FaBars, FaBell, FaChevronDown, FaUserCircle, FaBuilding, FaUser, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTransitionNavigate } from "../context/TransitionContext";
import "../Styles/Header.css";

function Header({ onMenuClick }) {
  const { user, tenant, settings } = useAuth();
  const navigateTo = useTransitionNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const username = user?.username || "Utilisateur";
  const role = user?.role || "PROPRIETAIRE";

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <motion.header
      className="premium-header glass"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FaBars />
        </button>
        <div className="welcome">
          <h2>Bonjour, {username}</h2>
          <p>Voici l'état de votre exploitation aujourd'hui</p>
        </div>
      </div>

      <div className="header-right">
        <div className="date-box">{today}</div>

        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>

        <div className="profile-dropdown" onClick={() => setShowProfile(!showProfile)}>
          <div className="profile-trigger">
            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h4>{username}</h4>
              <span>{role}</span>
            </div>
            <FaChevronDown className="arrow" />
          </div>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="profile-menu premium-card"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="profile-menu-header">
                  <p><FaBuilding /> {settings?.nom || tenant || "Public"}</p>
                  <p><FaUser /> {role}</p>
                  <p><FaEnvelope /> {user?.email || "email@inconnu.com"}</p>
                </div>
                
                <hr className="profile-menu-divider" />
                
                <button 
                  className="profile-menu-link"
                  onClick={() => navigateTo("/parametres")}
                >
                  Accéder à mon profil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;