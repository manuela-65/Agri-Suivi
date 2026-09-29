import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FaTasks, 
  FaBoxes, 
  FaClipboardList, 
  FaChevronRight, 
  FaCheckCircle, 
  FaClock, 
  FaShieldAlt,
  FaCalendarCheck,
  FaSeedling,
  FaCheck
} from "react-icons/fa";
import "../Styles/EmployeDashboard.css";

function EmployeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [taches, setTaches] = useState(() => {
    try {
      const data = localStorage.getItem("taches");
      return data ? JSON.parse(data) : [
        { id: 1, titre: "Irrigation Parcelle Nord", priorite: "Haute", statut: "En cours", date: new Date().toISOString().split('T')[0] },
        { id: 2, titre: "Contrôle sanitaire enclos Poulets", priorite: "Moyenne", statut: "À faire", date: new Date().toISOString().split('T')[0] },
        { id: 3, titre: "Inventaire des sacs d'engrais NPK", priorite: "Basse", statut: "Terminée", date: new Date().toISOString().split('T')[0] }
      ];
    } catch {
      return [];
    }
  });

  const toggleTache = (id) => {
    const updated = taches.map(t => {
      if (t.id === id) {
        return { ...t, statut: t.statut === "Terminée" ? "En cours" : "Terminée" };
      }
      return t;
    });
    setTaches(updated);
    try {
      localStorage.setItem("taches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const pendingCount = taches.filter(t => t.statut !== "Terminée").length;
  const doneCount = taches.filter(t => t.statut === "Terminée").length;
  const todayStr = new Date().toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="employe-dashboard-container">
      {/* 1. WELCOME HEADER */}
      <div className="emp-welcome-card">
        <div className="emp-welcome-info">
          <span className="emp-date-badge">
            <FaCalendarCheck /> {todayStr}
          </span>
          <h1>Bonjour, {user?.prenom || user?.username || "Opérateur"} ! 👋</h1>
          <p>Bienvenue sur votre poste terrain • Exploitation {user?.tenant_schema || "AgriSuivi"}</p>
        </div>
        <div className="emp-status-box">
          <span className="status-label">Présence du jour</span>
          <span className="status-pill active">
            <FaCheckCircle /> Pointage Confirmé (8h)
          </span>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="emp-stats-grid">
        <motion.div 
          className="emp-stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="emp-stat-icon orange">
            <FaTasks />
          </div>
          <div className="emp-stat-data">
            <span className="stat-title">Tâches en cours</span>
            <h3 className="stat-num">{pendingCount}</h3>
            <span className="stat-sub">À finaliser aujourd'hui</span>
          </div>
        </motion.div>

        <motion.div 
          className="emp-stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="emp-stat-icon green">
            <FaCheckCircle />
          </div>
          <div className="emp-stat-data">
            <span className="stat-title">Tâches complétées</span>
            <h3 className="stat-num">{doneCount}</h3>
            <span className="stat-sub">Validées avec succès</span>
          </div>
        </motion.div>

        <motion.div 
          className="emp-stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="emp-stat-icon blue">
            <FaClock />
          </div>
          <div className="emp-stat-data">
            <span className="stat-title">Heures travaillées</span>
            <h3 className="stat-num">32 h</h3>
            <span className="stat-sub">Sur la semaine courante</span>
          </div>
        </motion.div>

        <motion.div 
          className="emp-stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="emp-stat-icon purple">
            <FaShieldAlt />
          </div>
          <div className="emp-stat-data">
            <span className="stat-title">Traçabilité Terrain</span>
            <h3 className="stat-num">100%</h3>
            <span className="stat-sub">Preuves vidéo certifiées</span>
          </div>
        </motion.div>
      </div>

      {/* 3. QUICK ACTIONS BENTO */}
      <div className="emp-actions-section">
        <div className="section-title-row">
          <h3>⚡ Modules & Outils Opérationnels</h3>
          <span>Accès rapide à vos outils de travail</span>
        </div>
        <div className="emp-actions-grid">
          <motion.div 
            className="emp-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/taches")}
          >
            <div className="tile-icon-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FaTasks />
            </div>
            <div className="tile-info">
              <strong>Mes Tâches du Jour</strong>
              <span>Voir le planning et mettre à jour l'avancement</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="emp-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/activites")}
          >
            <div className="tile-icon-avatar" style={{ background: '#ecfdf5', color: '#059669' }}>
              <FaClipboardList />
            </div>
            <div className="tile-info">
              <strong>Déclarer une Activité / Soin</strong>
              <span>Enregistrer un travail avec preuve vidéo</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="emp-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/stocks")}
          >
            <div className="tile-icon-avatar" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <FaBoxes />
            </div>
            <div className="tile-info">
              <strong>Sortie / Entrée Stock</strong>
              <span>Déclarer l'usage d'engrais, semences ou matériel</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>
        </div>
      </div>

      {/* 4. TODAY TASKS DIRECT WIDGET */}
      <div className="emp-tasks-widget">
        <div className="widget-header">
          <div>
            <h3>📋 Tâches prioritaires assignées</h3>
            <p>Cochez pour marquer directement comme terminée</p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/taches")}
          >
            Toutes les tâches <FaChevronRight />
          </button>
        </div>

        <div className="emp-tasks-list">
          {taches.map(t => (
            <div 
              key={t.id} 
              className={`emp-task-row ${t.statut === "Terminée" ? "completed" : ""}`}
              onClick={() => toggleTache(t.id)}
            >
              <div className="task-checkbox">
                {t.statut === "Terminée" ? <FaCheck /> : null}
              </div>
              <div className="task-text-group">
                <strong className="task-title">{t.titre}</strong>
                <span className="task-meta">Échéance : {t.date}</span>
              </div>
              <span className={`task-badge ${t.statut === "Terminée" ? "done" : t.priorite === "Haute" ? "high" : "med"}`}>
                {t.statut === "Terminée" ? "Complétée" : t.priorite}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployeDashboard;