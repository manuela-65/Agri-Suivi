import React, { useState, useEffect } from "react";
import { FaSearch, FaShieldAlt, FaPlus, FaEdit, FaTrash, FaInfo } from "react-icons/fa";
import { TracabiliteService } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "../Styles/Tracabilite.css";

function Tracabilite() {
  const { user } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaErrors, setMediaErrors] = useState({});
  const isProprietaire = user?.role === "PROPRIETAIRE";

  const resolveMediaUrl = (value) => {
    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);
      const apiUrl = new URL(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
      );

      if (url.pathname.startsWith("/media/")) {
        url.protocol = apiUrl.protocol;
        url.host = apiUrl.host;
      }

      return url.toString();
    } catch {
      return value;
    }
  };

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
      {/* Decorative Orbs for Glassmorphism */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* HERO */}
      <motion.div 
          className="page-hero"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="page-hero-content">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Traçabilité des opérations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Historique certifié des actions enregistrées sur votre exploitation.
          </motion.p>
        </div>
        <motion.div 
          className="hero-icon-right"
          animate={{ rotate: [0, 5, -5, 0], y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaShieldAlt style={{ fontSize: '80px', color: 'rgba(255, 255, 255, 0.15)' }} />
        </motion.div>
      </motion.div>

      {/* SEARCH AND TIMELINE */}
      <motion.div 
        className="tracabilite-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
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
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaShieldAlt className="empty-icon" style={{ fontSize: '48px', color: 'var(--primary)' }} />
              </motion.div>
              <h2 style={{ marginTop: '16px' }}>Aucune opération trouvée</h2>
              <p>Le journal d'audit est vide pour cette recherche.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="timeline-container"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
                {resultat.map((log, index) => {
                    const { icon, colorClass } = getActionIconAndColor(log.type_action);
                    const mediaUrl = resolveMediaUrl(
                      log.video_url || log.preuve_video || log.media_url || log.proof_url
                    );
                    const isActivityMedia = ["activite", "activites", "activité", "activite agricole"].some((word) =>
                      (log.module || "").toLowerCase().includes(word)
                    );
                    const shouldShowMedia = !isActivityMedia || isProprietaire;

                    return (
                      <motion.div 
                          className="timeline-item" 
                          key={log.id || index}
                          variants={{
                            hidden: { opacity: 0, x: -40, y: 20 },
                            visible: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
                          }}
                          whileHover={{ scale: 1.01, x: 8 }}
                      >
                          <div className={`timeline-icon ${colorClass}`}>
                              {icon}
                          </div>
                          <div className="timeline-content glass-card">
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
                                  {mediaUrl && shouldShowMedia && (
                                    <div style={{ marginTop: 12 }}>
                                      {mediaErrors[log.id || index] ? (
                                        <p className="video-error">
                                          Cette vidéo est invalide ou ne peut pas être décodée par le navigateur.
                                        </p>
                                      ) : (
                                        <video
                                          src={mediaUrl}
                                          controls
                                          preload="metadata"
                                          playsInline
                                          onError={() => setMediaErrors((previous) => ({
                                            ...previous,
                                            [log.id || index]: true
                                          }))}
                                          style={{ width: "100%", maxHeight: 220, borderRadius: 10, display: "block", pointerEvents: "auto" }}
                                        />
                                      )}
                                    </div>
                                  )}
                                  {isActivityMedia && !isProprietaire && (
                                    <p style={{ marginTop: 10, color: "#9ca3af", fontStyle: "italic" }}>
                                      Vidéo d’activité réservée au propriétaire.
                                    </p>
                                  )}
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
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Tracabilite;