import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTransitionNavigate } from "../context/TransitionContext";
import {
  FaHome,
  FaTractor,
  FaUsers,
  FaSeedling,
  FaBox,
  FaMoneyBill,
  FaChartBar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaLeaf,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaBars,
  FaBuilding
  ,FaRobot
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "../Styles/Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const { user, tenant, settings, logout } = useAuth();
  const navigateTo = useTransitionNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = user?.role || "PROPRIETAIRE";

  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Admin. Plateforme",
      path: "/super-admin",
      icon: <FaBuilding />,
      roles: ["ADMIN_PLATFORME"]
    },
    {
      name: "Espace Employé",
      path: "/employe-dashboard",
      icon: <FaUsers />,
      roles: ["EMPLOYE"]
    },
    {
      name: "Exploitations",
      path: "/exploitations",
      icon: <FaTractor />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Employés",
      path: "/employes",
      icon: <FaUsers />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Mes Cultures",
      path: "/cultures",
      icon: <FaSeedling />,
      roles: ["PROPRIETAIRE", "EMPLOYE", "COMPTABLE"],
      condition: ['CULTURES', 'MIXTE'].includes(settings?.type_exploitation) || !settings?.type_exploitation
    },
    {
      name: "Mon Élevage",
      path: "/elevage",
      icon: <FaTractor />,
      roles: ["PROPRIETAIRE", "EMPLOYE"],
      condition: ['ELEVAGE', 'MIXTE'].includes(settings?.type_exploitation)
    },
    {
      name: "Stocks",
      path: "/stocks",
      icon: <FaBox />,
      roles: ["PROPRIETAIRE", "EMPLOYE"]
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <FaMoneyBill />,
      roles: ["PROPRIETAIRE", "COMPTABLE"]
    },
    {
      name: "Rapports",
      path: "/rapports",
      icon: <FaChartBar />,
      roles: ["PROPRIETAIRE", "COMPTABLE"]
    },
    {
      name: "Traçabilité",
      path: "/tracabilite",
      icon: <FaHistory />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Assistant IA",
      path: "/assistant-ia",
      icon: <FaRobot />,
      roles: ["PROPRIETAIRE"]
    },


    {
      name: "Mon Profil",
      path: "/profile",
      icon: <FaUserCircle />,
      roles: ["PROPRIETAIRE", "EMPLOYE", "COMPTABLE", "ADMIN_PLATFORME"]
    },
    {
      name: "Paramètres",
      path: "/parametres",
      icon: <FaCog />,
      roles: ["PROPRIETAIRE"]
    }
  ];

  const menu = allMenuItems.filter(item => item.roles.includes(role) && (item.condition === undefined || item.condition));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 90 : 280 }}
        className={`premium-sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >

        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <div className="brand-icon" onClick={() => isCollapsed && setIsCollapsed(false)} style={{ cursor: isCollapsed ? 'pointer' : 'default' }}>
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" />
              ) : (
                <div className="logo-placeholder">
                  <FaLeaf />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="brand-info">
                <h2>{settings?.nom || "AgriSuivi"}</h2>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="sidebar-header-right">
              <div className="notification-icon">
                <FaEnvelope />
                <span className="badge"></span>
              </div>
              <button className="toggle-sidebar-btn" onClick={() => setIsCollapsed(true)}>
                <FaBars />
              </button>
            </div>
          )}

          <button className="close-mobile-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-menu-container">
          <nav className="sidebar-menu">
            {menu.map((item, index) => {
              const isActive = location.pathname === item.path || (item.path === '/exploitations' && location.pathname.startsWith('/exploitation/')) || (item.path === '/employes' && location.pathname.startsWith('/employe/'));
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (window.innerWidth <= 1024) onClose();
                    navigateTo(item.path);
                  }}
                  className={`menu-link ${isActive ? "active" : ""}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="menu-link-left">
                    <span className="menu-icon">{item.icon}</span>
                    {!isCollapsed && <span className="menu-text">{item.name}</span>}
                  </div>
                  {!isCollapsed && !isActive && (
                    <span className="menu-chevron">
                      <FaChevronRight />
                    </span>
                  )}
                  {isActive && <motion.div layoutId="activeIndicator" className="active-indicator" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div 
            className="user-profile-card" 
            onClick={() => {
              if (window.innerWidth <= 1024) onClose();
              navigateTo("/profile");
            }}
            style={{ cursor: "pointer" }}
            title="Mon Profil"
          >
            <div className="user-avatar">
              <FaUserCircle />
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <h4>{user?.username || "Profil Utilisateur"}</h4>
                <span>{user?.email || "Email"}</span>
              </div>
            )}
          </div>
          
          <button className="logout-btn" onClick={logout} title="Déconnexion">
            <FaSignOutAlt />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;