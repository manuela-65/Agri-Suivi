import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaTractor,
  FaCog,
  FaSignOutAlt,
  FaCheck,
  FaCalendarAlt,
  FaUser
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTransitionNavigate } from "../context/TransitionContext";
import { NotificationService } from "../api/apiClient";
import "../Styles/Header.css";

function Header({ onMenuClick }) {
  const { user, tenant, settings, logout } = useAuth();
  const navigateTo = useTransitionNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const username = user?.first_name || user?.username || "Utilisateur";
  const role = user?.role || "PROPRIETAIRE";

  // Compact date formatting
  const todayFormatted = new Date().toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await NotificationService.getNotifications();
      setNotifications(res || []);
    } catch (error) {
      // quiet fail
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await NotificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.est_lu).length;

  const getRoleLabel = (r) => {
    switch (r) {
      case "PROPRIETAIRE":
        return "Propriétaire";
      case "EMPLOYE":
        return "Employé";
      case "COMPTABLE":
        return "Comptable";
      case "ADMIN_PLATFORME":
        return "Super Admin";
      default:
        return r;
    }
  };

  return (
    <header className="premium-header glass">
      {/* LEFT: Menu burger & Current context */}
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} title="Ouvrir le menu">
          <FaBars />
        </button>

        <div className="header-context">
          {tenant && tenant !== "public" ? (
            <div className="farm-badge" title="Exploitation active">
              <FaTractor className="farm-icon" />
              <span className="farm-name">{settings?.nom || tenant}</span>
            </div>
          ) : (
            <span className="schema-pill">Administration Centrale</span>
          )}
        </div>
      </div>

      {/* RIGHT: Date, Notifications & User menu */}
      <div className="header-right">
        {/* Date tag */}
        <div className="compact-date">
          <FaCalendarAlt className="date-icon" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications */}
        <div className="notification-container" ref={notifRef}>
          <button
            className={`header-action-btn ${unreadCount > 0 ? "has-unread" : ""}`}
            onClick={() => setShowNotif(!showNotif)}
            title="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                className="notif-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="notif-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="badge-pill warning">{unreadCount} non lue(s)</span>
                  )}
                </div>

                <div className="notif-body">
                  {notifications.length === 0 ? (
                    <div className="empty-notif">
                      <p>Aucune notification pour le moment</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${!n.est_lu ? "unread" : ""}`}
                      >
                        <div className="notif-info">
                          <h5>{n.titre}</h5>
                          <p>{n.message}</p>
                          <span className="notif-time">
                            {new Date(n.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {!n.est_lu && (
                          <button
                            className="mark-read-btn"
                            onClick={(e) => markAsRead(n.id, e)}
                            title="Marquer comme lu"
                          >
                            <FaCheck />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-container" ref={profileRef}>
          <button
            className="profile-trigger"
            onClick={() => setShowProfile(!showProfile)}
            title="Menu utilisateur"
          >
            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-text">
              <span className="profile-name">{username}</span>
              <span className="profile-role">{getRoleLabel(role)}</span>
            </div>
            <FaChevronDown className="profile-chevron" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="profile-menu-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="profile-menu-user-card">
                  <div className="menu-user-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="menu-user-details">
                    <strong>{username}</strong>
                    <span>{user?.email || "email@agrisuivi.cm"}</span>
                    <span className="role-tag">{getRoleLabel(role)}</span>
                  </div>
                </div>

                <div className="profile-menu-items">
                  <button
                    className="menu-item-btn"
                    onClick={() => {
                      setShowProfile(false);
                      navigateTo("/profile");
                    }}
                  >
                    <FaUser className="menu-item-icon" />
                    <span>Mon Profil</span>
                  </button>

                  {role === "PROPRIETAIRE" && (
                    <button
                      className="menu-item-btn"
                      onClick={() => {
                        setShowProfile(false);
                        navigateTo("/parametres");
                      }}
                    >
                      <FaCog className="menu-item-icon" />
                      <span>Paramètres de l'exploitation</span>
                    </button>
                  )}

                  <div className="menu-divider" />

                  <button
                    className="menu-item-btn danger"
                    onClick={() => {
                      setShowProfile(false);
                      logout();
                    }}
                  >
                    <FaSignOutAlt className="menu-item-icon" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;