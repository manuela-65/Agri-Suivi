import React, { useState } from "react";
import { FaBars, FaBell, FaChevronDown, FaUserCircle, FaBuilding, FaUser, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTransitionNavigate } from "../context/TransitionContext";
import { NotificationService } from "../api/apiClient";
import "../Styles/Header.css";

function Header({ onMenuClick }) {
  const { user, tenant, settings } = useAuth();
  const navigateTo = useTransitionNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const username = user?.username || "Utilisateur";
  const role = user?.role || "PROPRIETAIRE";

        const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await NotificationService.getNotifications();
      setNotifications(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.est_lu).length;

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

        <div className="notification-container" style={{ position: 'relative' }}>
          <button className="notification-btn" onClick={() => setShowNotif(!showNotif)}>
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          <AnimatePresence>
            {showNotif && (
              <motion.div
                className="profile-menu premium-card"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ width: '320px', right: 0, left: 'auto', padding: '15px' }}
              >
                <h4 style={{ margin: '0 0 10px 0', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Aucune notification</p>
                ) : (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', backgroundColor: n.est_lu ? 'transparent' : '#f0f9ff', borderRadius: '8px', marginBottom: '5px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>{n.titre}</div>
                        <div style={{ fontSize: '0.8rem', color: '#555', margin: '5px 0' }}>{n.message}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: '#888' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                          {!n.est_lu && (
                            <button onClick={() => markAsRead(n.id)} style={{ fontSize: '0.75rem', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Marquer lu</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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