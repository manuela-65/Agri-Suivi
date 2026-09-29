import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaShieldAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaInfo, 
  FaVideo, 
  FaTimes, 
  FaFilter,
  FaFileDownload
} from "react-icons/fa";
import { TracabiliteService } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "../Styles/Tracabilite.css";

function Tracabilite() {
  const { user } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState(null); // { url, author, date, desc }
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

  const [actionFilter, setActionFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  // Modules distincts dynamiques
  const uniqueModules = Array.from(new Set(logs.map(l => l.module || "Général").filter(Boolean)));

  const counts = {
    all: logs.length,
    creations: logs.filter(l => (l.type_action || l.action || "").toUpperCase() === "CREATION").length,
    modifs: logs.filter(l => (l.type_action || l.action || "").toUpperCase() === "MODIFICATION").length,
    suppr: logs.filter(l => (l.type_action || l.action || "").toUpperCase() === "SUPPRESSION").length,
  };

  const resultat = logs.filter((log) => {
    const term = recherche.toLowerCase();
    const uName = (log.nom_utilisateur || log.utilisateur || "").toLowerCase();
    const mod = (log.module || log.titre || "").toLowerCase();
    const desc = (log.description || "").toLowerCase();
    const matchesSearch = !term || uName.includes(term) || mod.includes(term) || desc.includes(term);

    const logAction = (log.type_action || log.action || "").toUpperCase();
    const matchesAction = actionFilter === "ALL" || logAction === actionFilter;

    const matchesModule = moduleFilter === "ALL" || (log.module || "Général").toLowerCase() === moduleFilter.toLowerCase();

    return matchesSearch && matchesAction && matchesModule;
  });

  const getActionBadge = (type) => {
    const t = type?.toUpperCase() || "INFO";
    if (t === "CREATION") return <span className="badge-pill success"><FaPlus style={{ fontSize: 9 }} /> Création</span>;
    if (t === "MODIFICATION") return <span className="badge-pill warning"><FaEdit style={{ fontSize: 9 }} /> Modification</span>;
    if (t === "SUPPRESSION") return <span className="badge-pill danger"><FaTrash style={{ fontSize: 9 }} /> Suppression</span>;
    return <span className="badge-pill info"><FaInfo style={{ fontSize: 9 }} /> {t}</span>;
  };

  const getModuleBadge = (mod) => {
    const m = (mod || "Général").toLowerCase();
    let cls = "mod-default";
    if (m.includes("culture") || m.includes("parcelle")) cls = "mod-crops";
    else if (m.includes("elevage") || m.includes("bétail")) cls = "mod-animals";
    else if (m.includes("stock") || m.includes("intrant")) cls = "mod-stock";
    else if (m.includes("transac") || m.includes("vente") || m.includes("finance")) cls = "mod-finance";
    else if (m.includes("employe") || m.includes("equipe")) cls = "mod-team";

    return <span className={`trace-module-tag ${cls}`}>{mod || "Général"}</span>;
  };

  return (
    <div className="compact-tracabilite">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="page-header-compact">
        <div className="page-header-title">
          <div>
            <h1>Traçabilité & Journal d'Audit</h1>
            <p>Historique horodaté et certifié de toutes les opérations de l'exploitation</p>
          </div>
        </div>
        <div className="page-header-compact-actions">
          <span className="trace-total-badge">
            <FaShieldAlt /> {logs.length} Événements sécurisés
          </span>
        </div>
      </div>

      {/* 2. DENSE AUDIT CARD */}
      <div className="trace-card-compact premium-card">
        {/* Controls Toolbar */}
        <div className="trace-toolbar-dense">
          <div className="search-box-dense">
            <FaSearch className="search-icon" />
            <input
              className="dense-input search-input"
              placeholder="Rechercher auteur, module, description..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            {recherche && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setRecherche("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="type-filters-dense">
            <button 
              className={`type-filter-btn ${actionFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActionFilter('ALL')}
            >
              Tous <span className="filter-count">{counts.all}</span>
            </button>
            <button 
              className={`type-filter-btn ${actionFilter === 'CREATION' ? 'active' : ''}`}
              onClick={() => setActionFilter('CREATION')}
            >
              Créations <span className="filter-count">{counts.creations}</span>
            </button>
            <button 
              className={`type-filter-btn ${actionFilter === 'MODIFICATION' ? 'active' : ''}`}
              onClick={() => setActionFilter('MODIFICATION')}
            >
              Modifications <span className="filter-count">{counts.modifs}</span>
            </button>
            <button 
              className={`type-filter-btn ${actionFilter === 'SUPPRESSION' ? 'active' : ''}`}
              onClick={() => setActionFilter('SUPPRESSION')}
            >
              Suppressions <span className="filter-count">{counts.suppr}</span>
            </button>
          </div>

          <div className="module-filter-select-wrapper">
            <FaFilter className="select-icon" />
            <select 
              value={moduleFilter} 
              onChange={(e) => setModuleFilter(e.target.value)}
              className="module-select-dense"
            >
              <option value="ALL">Tous les modules</option>
              {uniqueModules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <span className="trace-count-pill">{resultat.length} résultat(s)</span>
        </div>

        {/* Dense Audit Table */}
        {loading ? (
          <div className="empty-state">Chargement du journal d'audit...</div>
        ) : resultat.length === 0 ? (
          <div className="empty-state">
            <FaShieldAlt style={{ fontSize: 32, color: "var(--text-muted)", marginBottom: 8 }} />
            <p>Aucune trace enregistrée pour ces critères de recherche.</p>
          </div>
        ) : (
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th style={{ width: '135px' }}>Date & Heure</th>
                  <th style={{ width: '140px' }}>Utilisateur</th>
                  <th style={{ width: '120px' }}>Module</th>
                  <th style={{ width: '115px' }}>Action</th>
                  <th>Description de l'opération</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Preuve</th>
                </tr>
              </thead>
              <tbody>
                {resultat.map((log, index) => {
                  const mediaUrl = resolveMediaUrl(
                    log.video_url || log.preuve_video || log.media_url || log.proof_url
                  );
                  const isActivityMedia = ["activite", "activites", "activité", "activite agricole"].some((word) =>
                    (log.module || "").toLowerCase().includes(word)
                  );
                  const shouldShowMedia = !isActivityMedia || isProprietaire;
                  const hasVideo = mediaUrl && shouldShowMedia;

                  const formattedDate = log.created_at
                    ? new Date(log.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Maintenant";

                  return (
                    <tr key={log.id || index}>
                      <td className="cell-date">
                        <span>{formattedDate}</span>
                      </td>
                      <td>
                        <div className="audit-user-cell">
                          <div className="audit-user-avatar">
                            {(log.nom_utilisateur || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="audit-user-name">{log.nom_utilisateur || "Système"}</span>
                        </div>
                      </td>
                      <td>
                        {getModuleBadge(log.module)}
                      </td>
                      <td>
                        {getActionBadge(log.type_action || log.action)}
                      </td>
                      <td className="cell-desc">
                        <span className="desc-text" title={log.description}>{log.description}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {hasVideo ? (
                          <button 
                            type="button" 
                            className="btn-proof-preview"
                            title="Visualiser la preuve vidéo"
                            onClick={() => setActiveVideoModal({
                              url: mediaUrl,
                              author: log.nom_utilisateur || "Utilisateur",
                              date: formattedDate,
                              desc: log.description,
                              module: log.module
                            })}
                          >
                            <FaVideo /> Vidéo
                          </button>
                        ) : (
                          <span className="no-proof-text">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Proof Modal */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div 
              className="modal-content video-proof-modal"
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="video-modal-title">
                  <FaVideo className="text-primary" />
                  <div>
                    <h3>Preuve Vidéo Certifiée</h3>
                    <p>{activeVideoModal.module} • {activeVideoModal.author} ({activeVideoModal.date})</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="close-modal-btn" 
                  onClick={() => setActiveVideoModal(null)}
                  title="Fermer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="video-player-container">
                <video 
                  src={activeVideoModal.url} 
                  controls 
                  autoPlay 
                  playsInline
                  className="proof-video-element"
                >
                  Votre navigateur ne supporte pas la lecture de cette vidéo.
                </video>
              </div>

              <div className="video-modal-footer">
                <p className="video-desc-note"><strong>Détail :</strong> {activeVideoModal.desc}</p>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveVideoModal(null)}
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tracabilite;