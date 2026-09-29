import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaSeedling,
  FaBoxes,
  FaTractor,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaChevronRight,
  FaWallet,
  FaPlus,
  FaFileAlt
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { DashboardService } from "../api/apiClient";
import { useTransitionNavigate } from "../context/TransitionContext";
import { useAuth } from "../context/AuthContext";
import "../Styles/Dashboard.css";

function Dashboard() {
  const navigate = useTransitionNavigate();
  const { user, settings } = useAuth();
  const [stats, setStats] = useState({
    kpi: {
      employes_actifs: 0,
      cultures_en_cours: 0,
      parcelles_totales: 0,
      tetes_betail: 0,
      alertes_stock: 0
    },
    finances: {
      recettes: 0,
      depenses: 0,
      solde_net: 0,
      devise: "FCFA"
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboard() {
      try {
        setLoading(true);
        const data = await DashboardService.getStats();
        if (data) setStats(data);
      } catch (error) {
        console.log("Dashboard en mode démonstration");
      } finally {
        setLoading(false);
      }
    }
    getDashboard();
  }, []);

  const solde = stats?.finances?.solde_net || 0;
  const devise = stats?.finances?.devise || "FCFA";

  const kpis = [
    {
      title: "Solde Net Trésorerie",
      value: `${solde.toLocaleString()} ${devise}`,
      subtext: `Recettes: ${(stats?.finances?.recettes || 0).toLocaleString()} ${devise}`,
      icon: <FaWallet />,
      color: solde >= 0 ? "var(--primary)" : "var(--danger)",
      bgColor: solde >= 0 ? "var(--primary-light)" : "var(--danger-light)",
      trend: solde >= 0 ? "+12%" : "-5%",
      isPositive: solde >= 0
    },
    {
      title: "Cultures actives",
      value: stats?.kpi?.cultures_en_cours || 0,
      subtext: `Sur ${stats?.kpi?.parcelles_totales || 0} parcelle(s)`,
      icon: <FaSeedling />,
      color: "#059669",
      bgColor: "#ecfdf5",
      trend: "En croissance",
      isPositive: true
    },
    {
      title: "Cheptel & Élevage",
      value: `${stats?.kpi?.tetes_betail || 0} têtes`,
      subtext: "Effectif total",
      icon: <FaTractor />,
      color: "#0284c7",
      bgColor: "#e0f2fe",
      trend: "Stable",
      isPositive: true
    },
    {
      title: "Alertes Stocks",
      value: stats?.kpi?.alertes_stock || 0,
      subtext: (stats?.kpi?.alertes_stock || 0) > 0 ? "Articles sous le seuil" : "Stocks optimaux",
      icon: <FaBoxes />,
      color: (stats?.kpi?.alertes_stock || 0) > 0 ? "#ea580c" : "#10b981",
      bgColor: (stats?.kpi?.alertes_stock || 0) > 0 ? "#ffedd5" : "#d1fae5",
      trend: (stats?.kpi?.alertes_stock || 0) > 0 ? "Attention" : "OK",
      isAlert: (stats?.kpi?.alertes_stock || 0) > 0
    }
  ];

  const financeData = [
    { name: "Jan", recettes: 350000, depenses: 180000 },
    { name: "Fév", recettes: 520000, depenses: 210000 },
    { name: "Mar", recettes: 680000, depenses: 290000 },
    { name: "Avr", recettes: 890000, depenses: 410000 },
    { name: "Mai", recettes: 1150000, depenses: 380000 },
    { name: "Juin", recettes: stats?.finances?.recettes || 1400000, depenses: stats?.finances?.depenses || 480000 }
  ];

  return (
    <div className="compact-dashboard">
      {/* 1. COMPACT PAGE HEADER & ACTIONS */}
      <div className="page-header-compact">
        <div className="page-header-title">
          <div>
            <h1>Tableau de bord</h1>
            <p>Vue d'ensemble et performances de {settings?.nom || "votre exploitation"}</p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/rapports")}
          >
            <FaFileAlt /> Rapports
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/cultures")}
          >
            <FaSeedling /> Cultures
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/transactions")}
          >
            <FaPlus /> Nouvelle Vente
          </button>
        </div>
      </div>

      {/* 2. COMPACT KPI CARDS GRID */}
      <div className="compact-kpi-grid">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            className="compact-kpi-card premium-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
          >
            <div className="kpi-top-row">
              <div
                className="kpi-card-icon"
                style={{ color: kpi.color, backgroundColor: kpi.bgColor }}
              >
                {kpi.icon}
              </div>
              <span
                className={`kpi-trend-pill ${
                  kpi.isAlert ? "alert" : kpi.isPositive ? "positive" : "neutral"
                }`}
              >
                {kpi.trend}
              </span>
            </div>

            <div className="kpi-card-body">
              <span className="kpi-card-title">{kpi.title}</span>
              <h2 className="kpi-card-value">{kpi.value}</h2>
              <span className="kpi-card-subtext">{kpi.subtext}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2.5 QUICK ACTIONS BENTO HUB */}
      <div className="dashboard-quick-actions-bento">
        <div className="quick-actions-header">
          <h3>⚡ Accès Rapides & Opérations Prioritaires</h3>
          <span className="quick-actions-tagline">Raccourcis directs pour gérer votre quotidien agricole</span>
        </div>
        <div className="quick-actions-grid">
          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/cultures")}
          >
            <div className="tile-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <FaSeedling />
            </div>
            <div className="tile-content">
              <strong>Parcelles & Cultures</strong>
              <span>Suivi des cycles, semis et parcelles</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/elevage")}
          >
            <div className="tile-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <FaTractor />
            </div>
            <div className="tile-content">
              <strong>Cheptel & Élevage</strong>
              <span>Santé du bétail, naissances, soins</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/stocks")}
          >
            <div className="tile-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <FaBoxes />
            </div>
            <div className="tile-content">
              <strong>Entrées / Sorties Stock</strong>
              <span>Intrants, semences, récoltes</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/transactions")}
          >
            <div className="tile-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FaWallet />
            </div>
            <div className="tile-content">
              <strong>Nouvelle Transaction</strong>
              <span>Encaisser vente ou saisir dépense</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/employes")}
          >
            <div className="tile-icon-box" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <FaUsers />
            </div>
            <div className="tile-content">
              <strong>Feuille de Pointage</strong>
              <span>Présences du jour & heures de l'équipe</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>

          <motion.div 
            className="quick-action-tile"
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate("/rapports")}
          >
            <div className="tile-icon-box" style={{ background: '#f1f5f9', color: '#475569' }}>
              <FaFileAlt />
            </div>
            <div className="tile-content">
              <strong>Bilans & Rapports</strong>
              <span>Exporter rapports financiers PDF / Excel</span>
            </div>
            <FaChevronRight className="tile-chevron" />
          </motion.div>
        </div>
      </div>

      {/* 3. CHARTS & RECENT ACTIVITIES */}
      <div className="dashboard-content-split">
        {/* Left: Financial Chart */}
        <motion.div
          className="chart-card-compact premium-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div className="chart-compact-header">
            <div>
              <h3>Évolution Financière</h3>
              <p>Recettes vs Dépenses (6 derniers mois)</p>
            </div>
            <div className="chart-legend-compact">
              <span className="legend-chip">
                <span className="dot recettes" /> Recettes
              </span>
              <span className="legend-chip">
                <span className="dot depenses" /> Dépenses
              </span>
            </div>
          </div>

          <div className="chart-compact-body">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={financeData}
                margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="recettesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} FCFA`]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="recettes"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#recettesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#depensesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Quick Recent Activity Feed */}
        <motion.div
          className="activity-feed-compact premium-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="activity-compact-header">
            <h3>Activités Récentes</h3>
            <button
              className="text-link-btn"
              onClick={() => navigate("/tracabilite")}
            >
              Tout voir <FaChevronRight />
            </button>
          </div>

          <div className="activity-compact-list">
            <div className="activity-compact-item">
              <div className="activity-dot success">
                <FaCheckCircle />
              </div>
              <div className="activity-detail">
                <div className="activity-title-row">
                  <strong>Récolte terminée</strong>
                  <span className="activity-time">Aujourd'hui</span>
                </div>
                <p>Parcelle A : 120 kg de maïs récoltés</p>
              </div>
            </div>

            <div className="activity-compact-item">
              <div className="activity-dot info">
                <FaChartLine />
              </div>
              <div className="activity-detail">
                <div className="activity-title-row">
                  <strong>Paiement reçu</strong>
                  <span className="activity-time">Hier</span>
                </div>
                <p>Vente de 50 sacs de maïs (150,000 FCFA)</p>
              </div>
            </div>

            <div className="activity-compact-item">
              <div className="activity-dot warning">
                <FaExclamationTriangle />
              </div>
              <div className="activity-detail">
                <div className="activity-title-row">
                  <strong>Alerte Stock</strong>
                  <span className="activity-time">Hier</span>
                </div>
                <p>Engrais NPK sous le seuil critique (5 sacs restants)</p>
              </div>
            </div>

            <div className="activity-compact-item">
              <div className="activity-dot success">
                <FaSeedling />
              </div>
              <div className="activity-detail">
                <div className="activity-title-row">
                  <strong>Semis enregistré</strong>
                  <span className="activity-time">Il y a 3j</span>
                </div>
                <p>Semis de Bananiers Plantains (Champ Sud)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;