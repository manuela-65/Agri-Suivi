import React, { useEffect, useState } from "react";
import {
    FaUsers,
    FaSeedling,
    FaBoxes,
    FaTractor,
    FaExclamationTriangle,
    FaCheckCircle,
    FaArrowUp,
    FaChartLine,
    FaChevronRight,
    FaWallet
} from "react-icons/fa";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { DashboardService } from "../api/apiClient";
import { useTransitionNavigate } from "../context/TransitionContext";
import "../Styles/Dashboard.css";

function Dashboard() {
    const navigate = useTransitionNavigate();
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

    useEffect(() => {
        async function getDashboard() {
            try {
                const data = await DashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.log("Dashboard en mode démonstration");
            }
        }
        getDashboard();
    }, []);

    const indicators = [
        {
            title: "Parcelles & Élevage",
            value: stats.kpi.parcelles_totales,
            icon: <FaTractor />,
            trend: "+2% ce mois",
            color: "var(--primary)"
        },
        {
            title: "Cultures actives",
            value: stats.kpi.cultures_en_cours,
            icon: <FaSeedling />,
            trend: "Optimal",
            color: "#0284c7"
        },
        {
            title: "Employés",
            value: stats.kpi.employes_actifs,
            icon: <FaUsers />,
            trend: "Stable",
            color: "#8b5cf6"
        },
        {
            title: "Alertes Stocks",
            value: stats.kpi.alertes_stock,
            icon: <FaBoxes />,
            trend: "À vérifier",
            color: "var(--accent)"
        }
    ];

    const financeData = [
        { name: "Jan", recettes: 300000, depenses: 150000 },
        { name: "Fev", recettes: 500000, depenses: 200000 },
        { name: "Mar", recettes: 700000, depenses: 300000 },
        { name: "Avr", recettes: 900000, depenses: 450000 },
        { name: "Mai", recettes: 1200000, depenses: 400000 },
        { name: "Juin", recettes: 1500000, depenses: 500000 }
    ];

    return (
        <div className="premium-dashboard">
            {/* HERO SECTION */}
            <motion.div 
                className="dashboard-hero premium-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="hero-content">
                    <h1>Vue d'ensemble</h1>
                    <p>Suivez les performances de votre exploitation en temps réel avec des indicateurs clés.</p>
                </div>
                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => navigate("/exploitations")}>
                        Voir mes exploitations <FaChevronRight />
                    </button>
                </div>
            </motion.div>

            {/* KPI GRID */}
            <div className="kpi-bento-grid">
                {/* Finance Summary Card (Bento Style) */}
                <motion.div 
                    className="kpi-main-card premium-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="kpi-main-header">
                        <div className="icon-wrapper" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                            <FaWallet />
                        </div>
                        <span className="badge">Ce mois</span>
                    </div>
                    <div className="kpi-main-body">
                        <h3>Solde Net</h3>
                        <h2>{stats.finances.solde_net.toLocaleString()} {stats.finances.devise}</h2>
                        <div className="trend positive">
                            <FaArrowUp /> 14% par rapport au mois dernier
                        </div>
                    </div>
                </motion.div>

                {/* Smaller KPI Cards */}
                {indicators.map((item, index) => (
                    <motion.div 
                        key={index}
                        className="kpi-small-card premium-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + (index * 0.05) }}
                    >
                        <div className="kpi-icon-header">
                            <div className="kpi-icon" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                                {item.icon}
                            </div>
                            <span className="trend-text">{item.trend}</span>
                        </div>
                        <div className="kpi-content">
                            <h3>{item.value}</h3>
                            <p>{item.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CHARTS & ACTIVITY */}
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
                            <h3>Évolution Financière</h3>
                            <p>Recettes vs Dépenses (6 derniers mois)</p>
                        </div>
                        <button className="btn btn-secondary">Rapport détaillé</button>
                    </div>
                    
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Area type="monotone" dataKey="recettes" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRecettes)" />
                                <Area type="monotone" dataKey="depenses" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorDepenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Side Panel */}
                <div className="dashboard-side-panel">
                    <motion.div 
                        className="activity-card premium-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="card-header">
                            <h3>Activités récentes</h3>
                        </div>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon success"><FaCheckCircle /></div>
                                <div className="activity-text">
                                    <strong>Nouvelle récolte</strong>
                                    <span>Parcelle A - 120kg (Aujourd'hui)</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon info"><FaChartLine /></div>
                                <div className="activity-text">
                                    <strong>Vente validée</strong>
                                    <span>Client X - 150,000 FCFA (Hier)</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon warning"><FaExclamationTriangle /></div>
                                <div className="activity-text">
                                    <strong>Alerte Stock Engrais</strong>
                                    <span>Niveau critique atteint (Hier)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;