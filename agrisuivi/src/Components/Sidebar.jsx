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
  FaBars,
  FaBuilding,
  FaTasks,
  FaClipboardList
} from "react-icons/fa";
import { motion } from "framer-motion";
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
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <FaHome />,
      roles: ["PROPRIETAIRE", "COMPTABLE"]
    },
    {
      name: "Admin Plateforme",
      path: "/super-admin",
      icon: <FaBuilding />,
      roles: ["ADMIN_PLATFORME"]
    },
    {
      name: "Espace Terrain",
      path: "/employe-dashboard",
      icon: <FaUsers />,
      roles: ["EMPLOYE"]
    },
    {
      name: "Mes Tâches",
      path: "/taches",
      icon: <FaTasks />,
      roles: ["EMPLOYE"]
    },
    {
      name: "Activités",
      path: "/activites",
      icon: <FaClipboardList />,
      roles: ["EMPLOYE"]
    },
    {
      name: "Équipe & Présence",
      path: "/employes",
      icon: <FaUsers />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Cultures",
      path: "/cultures",
      icon: <FaSeedling />,
      roles: ["PROPRIETAIRE", "EMPLOYE", "COMPTABLE"],
      condition: ['CULTURES', 'MIXTE'].includes(settings?.type_exploitation) || !settings?.type_exploitation
    },
    {
      name: "Élevage",
      path: "/elevage",
      icon: <FaTractor />,
      roles: ["PROPRIETAIRE", "EMPLOYE"],
      condition: ['ELEVAGE', 'MIXTE'].includes(settings?.type_exploitation)
    },
    {
      name: "Stocks & Intrants",
      path: "/stocks",
      icon: <FaBox />,
      roles: ["PROPRIETAIRE", "EMPLOYE"]
    },
    {
      name: "Finances",
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
      name: "Traçabilité & Audit",
      path: "/tracabilite",
      icon: <FaHistory />,
      roles: ["PROPRIETAIRE"]
    },
    {
      name: "Paramètres",
      path: "/parametres",
      icon: <FaCog />,
      roles: ["PROPRIETAIRE"]
    }
  ];

  const menu = allMenuItems.filter(
    item => item.roles.includes(role) && (item.condition === undefined || item.condition)
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`premium-sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-left" onClick={() => isCollapsed && setIsCollapsed(false)}>
            <div className="brand-icon">
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
                <h2>AgriSuivi</h2>
                <span className="tenant-tag">Agri-Manager</span>
              </div>
            )}
          </div>

          <button
            className="toggle-sidebar-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          <button className="close-mobile-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar-menu-container">
          <nav className="sidebar-menu">
            {menu.map((item, index) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/exploitations" && location.pathname.startsWith("/exploitation/")) ||
                (item.path === "/employes" && location.pathname.startsWith("/employe/"));

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
                  {!isCollapsed && isActive && (
                    <motion.div layoutId="activePill" className="active-indicator" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="sidebar-footer">
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