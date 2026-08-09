import React, { useState, useEffect } from "react";
import { FaSearch, FaShieldAlt, FaPlus, FaEdit, FaTrash, FaInfo } from "react-icons/fa";
import { TracabiliteService } from "../api/apiClient";
import { motion } from "framer-motion";
import "../Styles/Tracabilite.css";

function Tracabilite() {
  const [recherche, setRecherche] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await TracabiliteService.getLogs();
        const results = Array.isArray(data) ? data : data.results || [];
        setLogs(results);
      } catch (err) {
        console.log("Erreur chargement logs.");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const resultat = logs.filter((log) => {
    const term = recherche.toLowerCase();
    const user = (log.nom_utilisateur || log.utilisateur || "").toLowerCase();
    const module = (log.module || log.titre || "").toLowerCase();
    const desc = (log.description || "").toLowerCase();
    return user.includes(term) || module.includes(term) || desc.includes(term);
  });

  const getActionIconAndColor = (type) => {
      const typeUpper = type?.toUpperCase() || "INFO";
      if (typeUpper === "CREATION") return { icon: <FaPlus />, colorClass: "bg-creation" };
      if (typeUpper === "MODIFICATION") return { icon: <FaEdit />, colorClass: "bg-modification" };
      if (typeUpper === "SUPPRESSION") return { icon: <FaTrash />, colorClass: "bg-suppression" };
      return { icon: <FaInfo />, colorClass: "bg-info" };
  };

  return (
    <div className="premium-tracabilite">
      {/* HERO */}
      <motion.div 
          className="page-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
      >
        <div className="page-hero-content">
          <h1>Traçabilité des opérations</h1>
          <p>
            Historique certifié des actions enregistrées sur votre exploitation.
          </p>
        </div>
        <div className="hero-icon-right">
          <FaShieldAlt style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.2)' }} />
        </div>
      </motion.div>

      {/* SEARCH AND TIMELINE */}
      <motion.div 
        className="premium-card tracabilite-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              className="premium-input"
              placeholder="Rechercher par utilisateur, module ou action..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>

        <div className="trace-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement du journal d'audit...</p>
            </div>
          ) : resultat.length === 0 ? (
            <div className="empty-state">
              <FaShieldAlt className="empty-icon" />
              <h2>Aucune opération enregistrée</h2>
              <p>Le journal d'audit est vide pour cette recherche.</p>
            </div>
          ) : (
            <div className="timeline-container">
                {resultat.map((log, index) => {
                    const { icon, colorClass } = getActionIconAndColor(log.type_action);
                    return (
                      <motion.div 
                          className="timeline-item" 
                          key={log.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                      >
                          <div className={`timeline-icon ${colorClass}`}>
                              {icon}
                          </div>
                          <div className="timeline-content premium-card">
                              <div className="timeline-header">
                                  <div className="timeline-user">
                                      <span className="user-name">{log.nom_utilisateur || "Système"}</span>
                                      <span className="role-badge">{log.role_utilisateur || "N/A"}</span>
                                  </div>
                                  <div className="timeline-date">
                                      {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR") : "Maintenant"}
                                  </div>
                              </div>
                              <div className="timeline-body">
                                  <p>{log.description}</p>
                              </div>
                              <div className="timeline-meta">
                                  <span className={`status-badge ${colorClass}`}>
                                      {log.type_action || "INFO"}
                                  </span>
                                  <span className="module-badge">
                                      Module : <strong>{log.module || "Général"}</strong>
                                  </span>
                              </div>
                          </div>
                      </motion.div>
                    );
                })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Tracabilite;