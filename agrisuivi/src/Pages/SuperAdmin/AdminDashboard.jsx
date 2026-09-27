import React, { useState, useEffect } from "react";
import { SuperAdminService } from "../../api/apiClient";
import toast from "react-hot-toast";
import { 
  FaBuilding, FaCheckCircle, FaBan, FaChartPie, FaSearch, 
  FaUsers, FaBell, FaChevronRight, FaServer, FaPowerOff, 
  FaEye, FaExclamationTriangle, FaTimes
} from "react-icons/fa";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "../../Styles/Dashboard.css"; // Héritage direct du style du Propriétaire
import "./AdminDashboard.css"; // Styles spécifiques à l'admin (table, modale)

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_farms: 0,
    active_farms: 0,
    suspended_farms: 0,
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for Notification Modal
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, clientsData] = await Promise.all([
        SuperAdminService.getPlatformStats(),
        SuperAdminService.getAllClients()
      ]);
      setStats(statsData || {});
      const clientsList = clientsData?.results ? clientsData.results : clientsData;
      setClients(Array.isArray(clientsList) ? clientsList : []);
    } catch (error) {
      toast.error("Erreur lors de la récupération des données.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (clientId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await SuperAdminService.updateClientStatus(clientId, newStatus);
      toast.success(`Exploitation ${newStatus ? 'réactivée' : 'suspendue'} avec succès.`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMsg.trim()) {
      toast.error("Le message ne peut pas être vide.");
      return;
    }
    setIsSendingNotif(true);
    try {
      await SuperAdminService.sendGlobalNotification(notificationMsg);
      toast.success("Notification globale envoyée avec succès.");
      setNotificationMsg("");
      setShowNotifModal(false);
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la notification.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client?.schema_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client?.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Faux data pour le graphique (comme sur le dashboard propriétaire) en attendant l'API
  const growthData = [
    { name: "Jan", exploitations: 12, actives: 10 },
    { name: "Fev", exploitations: 19, actives: 18 },
    { name: "Mar", exploitations: 25, actives: 24 },
    { name: "Avr", exploitations: 32, actives: 30 },
    { name: "Mai", exploitations: 45, actives: 43 },
    { name: "Juin", exploitations: stats?.total_farms || 50, actives: stats?.active_farms || 48 }
  ];

  return (
    <div className="premium-dashboard admin-specific-override">
      
      {/* 1. HERO SECTION (Identique au dashboard propriétaire) */}
      <motion.div 
          className="dashboard-hero premium-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
      >
          <div className="hero-content">
              <h1>Plateforme AgriSuivi</h1>
              <p>Vue globale et administration centralisée de l'écosystème SaaS (Locataires, licences, annonces globales).</p>
          </div>
          <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setShowNotifModal(true)} style={{ background: "white", color: "var(--primary)" }}>
                  <FaBell /> Diffuser une annonce
              </button>
          </div>
      </motion.div>

      {/* 2. KPI BENTO GRID (Identique au dashboard propriétaire) */}
      <div className="kpi-bento-grid">
          {/* Main Card */}
          <motion.div 
              className="kpi-main-card premium-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
          >
              <div className="kpi-main-header">
                  <div className="icon-wrapper" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                      <FaBuilding />
                  </div>
                  <span className="badge">Temps réel</span>
              </div>
              <div className="kpi-main-body">
                  <h3>Exploitations Totales</h3>
                  <h2>{loading ? "..." : (stats?.total_farms || 0)} enregistrées</h2>
                  <div className="trend positive">
                      Réseau global de la plateforme
                  </div>
              </div>
          </motion.div>

          {/* Small Cards */}
          <motion.div 
              className="kpi-small-card premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
          >
              <div className="kpi-icon-header">
                  <div className="kpi-icon" style={{ color: "#0284c7", backgroundColor: "#0284c715" }}>
                      <FaCheckCircle />
                  </div>
                  <span className="trend-text">Opérationnel</span>
              </div>
              <div className="kpi-content">
                  <h3>{loading ? "..." : (stats?.active_farms || 0)}</h3>
                  <p>Licences Actives</p>
              </div>
          </motion.div>

          <motion.div 
              className="kpi-small-card premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
          >
              <div className="kpi-icon-header">
                  <div className="kpi-icon" style={{ color: "#dc2626", backgroundColor: "#dc262615" }}>
                      <FaBan />
                  </div>
                  <span className="trend-text">Bloqué</span>
              </div>
              <div className="kpi-content">
                  <h3>{loading ? "..." : (stats?.suspended_farms || 0)}</h3>
                  <p>Comptes Suspendus</p>
              </div>
          </motion.div>

          <motion.div 
              className="kpi-small-card premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
          >
              <div className="kpi-icon-header">
                  <div className="kpi-icon" style={{ color: "#8b5cf6", backgroundColor: "#8b5cf615" }}>
                      <FaServer />
                  </div>
                  <span className="trend-text">Stable</span>
              </div>
              <div className="kpi-content">
                  <h3>100%</h3>
                  <p>Santé Serveur</p>
              </div>
          </motion.div>
      </div>

      {/* 3. CHARTS & ACTIVITY (Identique au dashboard propriétaire) */}
      <div className="dashboard-content-grid">
          {/* Chart Area */}
          <motion.div 
              className="chart-container premium-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
          >
              <div className="chart-header">
                  <div>
                      <h3>Croissance du réseau</h3>
                      <p>Évolution des inscriptions (6 derniers mois)</p>
                  </div>
              </div>
              
              <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                          <Area type="monotone" dataKey="exploitations" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                          <Area type="monotone" dataKey="actives" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </motion.div>

          {/* Side Panel (Server Health) */}
          <div className="dashboard-side-panel">
              <motion.div 
                  className="activity-card premium-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
              >
                  <div className="card-header">
                      <h3>État des Services</h3>
                  </div>
                  <div className="activity-list">
                      <div className="activity-item">
                          <div className="activity-icon success"><FaCheckCircle /></div>
                          <div className="activity-text">
                              <strong>API Centrale</strong>
                              <span>Opérationnelle (Latence: 45ms)</span>
                          </div>
                      </div>
                      <div className="activity-item">
                          <div className="activity-icon success"><FaCheckCircle /></div>
                          <div className="activity-text">
                              <strong>Base de données</strong>
                              <span>Synchronisée (Load: 12%)</span>
                          </div>
                      </div>
                      <div className="activity-item">
                          <div className="activity-icon warning"><FaExclamationTriangle /></div>
                          <div className="activity-text">
                              <strong>Service Emails</strong>
                              <span>File d'attente élevée (250 msgs)</span>
                          </div>
                      </div>
                  </div>
              </motion.div>
          </div>
      </div>

      {/* 4. TABLEAU DES EXPLOITATIONS (Style Ultra-Premium) */}
      <motion.div 
        className="admin-clients-card premium-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="admin-clients-header">
          <div>
            <h3>Registre des Exploitations</h3>
            <p>Gérez les accès et surveillez l'activité des locataires SaaS.</p>
          </div>
          <div className="admin-clients-search">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-clients-table-wrapper">
          <table className="admin-clients-table">
            <thead>
              <tr>
                <th>Exploitation</th>
                <th>Propriétaire</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
                <th className="right-align">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">Chargement des données...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FaSearch style={{fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '10px'}} />
                    <p>Aucune exploitation trouvée.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const initial = client.name ? client.name.charAt(0).toUpperCase() : 'F';
                  return (
                    <tr key={client.id} className="premium-table-row">
                      <td>
                        <div className="client-entity">
                          <div className="client-avatar">{initial}</div>
                          <div className="client-details">
                            <span className="client-name">{client.name}</span>
                            <span className="client-schema">{client.schema_name}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="client-owner-info">
                          <span className="owner-name">{client.owner_name}</span>
                          <span className="owner-email">{client.owner_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="client-date">
                          {client.created_on ? new Date(client.created_on).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className={`premium-status-pill ${client.is_active ? 'status-active' : 'status-suspended'}`}>
                          <span className="status-dot"></span>
                          {client.is_active ? 'Active' : 'Suspendue'}
                        </div>
                      </td>
                      <td className="right-align">
                        <div className="client-actions">
                          <button className="ghost-btn" title="Voir détails">
                            <FaEye />
                          </button>
                          <button 
                            className={`ghost-btn ${client.is_active ? 'danger-hover' : 'success-hover'}`} 
                            onClick={() => toggleStatus(client.id, client.is_active)}
                            title={client.is_active ? "Suspendre l'accès" : "Réactiver l'accès"}
                          >
                            <FaPowerOff />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotifModal && (
          <div className="admin-modal-overlay">
            <motion.div 
              className="admin-modal premium-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="admin-modal-header">
                <h3>Diffuser une annonce</h3>
                <button className="close-btn" onClick={() => setShowNotifModal(false)}><FaTimes /></button>
              </div>
              <div className="admin-modal-body">
                <p>Ce message sera affiché sur le tableau de bord de toutes les exploitations du réseau AgriSuivi.</p>
                <textarea 
                  placeholder="Ex: Maintenance système prévue ce soir à 23h..."
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="admin-modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNotifModal(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSendNotification} disabled={isSendingNotif}>
                  {isSendingNotif ? "Envoi en cours..." : "Diffuser maintenant"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminDashboard;
