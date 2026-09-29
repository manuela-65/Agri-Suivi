import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaMoneyBillWave,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaFilter
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FinancesService } from "../api/apiClient";
import "../Styles/Transactions.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const COLORS = {
    entrees: '#22c55e', 
    sorties: '#ef4444'  
};

function Transactions() {
    const [modal, setModal] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [filtre, setFiltre] = useState("Tous");
    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState([]);
    const [bilan, setBilan] = useState({ total_recettes: 0, total_depenses: 0, solde_net: 0 });

    const [form, setForm] = useState({
        type_transaction: "VENTE",
        montant: "",
        date_transaction: "",
        description: "",
        mode_paiement: "CASH"
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [transData, bilanData] = await Promise.allSettled([
                FinancesService.getAll(),
                FinancesService.getBilan()
            ]);
            setTransactions(transData.status === 'fulfilled' && Array.isArray(transData.value) ? transData.value : []);
            if (bilanData.status === 'fulfilled' && bilanData.value) {
                const b = bilanData.value;
                setBilan({
                    total_recettes: (parseFloat(b.total_ventes) || 0) + (parseFloat(b.total_revenus) || 0),
                    total_depenses: (parseFloat(b.total_achats) || 0) + (parseFloat(b.total_depenses) || 0),
                    solde_net: parseFloat(b.solde_net) || 0
                });
            }
        } catch (error) {
            console.warn("Info chargement transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (file) {
                formData.append('justificatif_photo', file);
            }
            await FinancesService.create(formData);
            toast.success("Transaction enregistrée !");
            setModal(false);
            setForm({ type_transaction: "VENTE", montant: "", date_transaction: "", description: "", mode_paiement: "CASH" });
            setFile(null);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement de la transaction.");
        }
    };

    const supprimer = (id) => {
        toast.error("La suppression est bloquée. Veuillez procéder à une annulation.", { duration: 5000 });
    };

    const resultats = transactions.filter(t => {
        const matchRecherche = (t.description || "").toLowerCase().includes(recherche.toLowerCase());
        const categoryType = ['VENTE', 'REVENU'].includes(t.type_transaction) ? 'Entrée' : 'Sortie';
        return matchRecherche && (filtre === "Tous" || filtre === categoryType);
    });

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Historique des Transactions", 14, 15);
        const tableColumn = ["Date", "Type", "Montant (FCFA)", "Description", "Paiement"];
        const tableRows = resultats.map(t => [
            t.date_transaction,
            t.type_transaction,
            t.montant,
            t.description,
            t.mode_paiement
        ]);
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("transactions.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(resultats.map(t => ({
            Date: t.date_transaction,
            Type: t.type_transaction,
            "Montant (FCFA)": t.montant,
            Description: t.description,
            Paiement: t.mode_paiement
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "transactions.xlsx");
    };

    const pieData = [
        { name: "Entrées", value: bilan.total_recettes },
        { name: "Sorties", value: bilan.total_depenses }
    ];

    return (
        <div className="premium-transactions">
            {/* HERO */}
            {/* 1. COMPACT PAGE HEADER */}
            <div className="page-header-compact">
                <div className="page-header-title">
                    <div>
                        <h1>Finances & Transactions</h1>
                        <p>Suivi en direct des flux de trésorerie de votre exploitation</p>
                    </div>
                </div>
                
                <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
                    <FaPlus /> Nouvelle Transaction
                </button>
            </div>

            {/* 2. COMPACT KPI STATS */}
            <div className="compact-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <motion.div className="compact-kpi-card premium-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="kpi-top-row">
                        <div className="kpi-card-icon" style={{ color: "#059669", backgroundColor: "#ecfdf5" }}>
                            <FaArrowUp />
                        </div>
                        <span className="badge-pill success">Recettes</span>
                    </div>
                    <div className="kpi-card-body">
                        <span className="kpi-card-title">Entrées Totales</span>
                        <h2 className="kpi-card-value" style={{ color: "#059669" }}>{bilan.total_recettes.toLocaleString()} FCFA</h2>
                        <span className="kpi-card-subtext">Ventes et revenus validés</span>
                    </div>
                </motion.div>

                <motion.div className="compact-kpi-card premium-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="kpi-top-row">
                        <div className="kpi-card-icon" style={{ color: "#dc2626", backgroundColor: "#fee2e2" }}>
                            <FaArrowDown />
                        </div>
                        <span className="badge-pill danger">Dépenses</span>
                    </div>
                    <div className="kpi-card-body">
                        <span className="kpi-card-title">Sorties Totales</span>
                        <h2 className="kpi-card-value" style={{ color: "#dc2626" }}>{bilan.total_depenses.toLocaleString()} FCFA</h2>
                        <span className="kpi-card-subtext">Achats et charges d'exploitation</span>
                    </div>
                </motion.div>

                <motion.div className="compact-kpi-card premium-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="kpi-top-row">
                        <div className="kpi-card-icon" style={{ color: bilan.solde_net >= 0 ? "#059669" : "#dc2626", backgroundColor: bilan.solde_net >= 0 ? "#ecfdf5" : "#fee2e2" }}>
                            <FaMoneyBillWave />
                        </div>
                        <span className={`badge-pill ${bilan.solde_net >= 0 ? "success" : "danger"}`}>Solde</span>
                    </div>
                    <div className="kpi-card-body">
                        <span className="kpi-card-title">Solde Net</span>
                        <h2 className="kpi-card-value" style={{ color: bilan.solde_net >= 0 ? "#059669" : "#dc2626" }}>
                            {bilan.solde_net.toLocaleString()} FCFA
                        </h2>
                        <span className="kpi-card-subtext">{bilan.solde_net >= 0 ? "Trésorerie positive" : "Déficit temporaire"}</span>
                    </div>
                </motion.div>
            </div>

            {/* 3. CHART & BREAKDOWN */}
            <motion.div 
                className="chart-card-transactions premium-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="chart-header-compact">
                    <h2><FaChartPie /> Répartition Entrées / Sorties</h2>
                    <div className="chart-legend-compact">
                        <span className="legend-item"><span className="dot entrees"></span> Entrées ({bilan.total_recettes.toLocaleString()} FCFA)</span>
                        <span className="legend-item"><span className="dot sorties"></span> Sorties ({bilan.total_depenses.toLocaleString()} FCFA)</span>
                    </div>
                </div>
                {bilan.total_recettes === 0 && bilan.total_depenses === 0 ? (
                    <div className="empty-state">Aucune donnée financière pour l'instant.</div>
                ) : (
                    <div className="chart-body" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={COLORS.entrees} />
                                    <Cell fill={COLORS.sorties} />
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `${value.toLocaleString()} FCFA`}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* 4. TABLE AND FILTERS */}
            <motion.div 
                className="table-card-compact premium-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <div className="table-toolbar-compact">
                    <div className="table-toolbar-left">
                        <div className="search-box" style={{ flex: 1 }}>
                            <FaSearch />
                            <input
                                className="premium-input"
                                placeholder="Rechercher une transaction..."
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                            />
                        </div>
                        <select 
                            value={filtre} 
                            onChange={(e) => setFiltre(e.target.value)} 
                            className="premium-input filter-select"
                            style={{ width: '160px' }}
                        >
                            <option value="Tous">Toutes</option>
                            <option value="Entrée">Entrées seules</option>
                            <option value="Sortie">Sorties seules</option>
                        </select>
                    </div>

                    <div className="table-toolbar-right">
                        <button className="btn btn-secondary btn-sm" onClick={exportPDF}>Export PDF</button>
                        <button className="btn btn-secondary btn-sm" onClick={exportExcel}>Export Excel</button>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">Chargement des transactions...</div>
                ) : (
                    <div className="compact-table-container">
                        <table className="compact-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Mode Paiement</th>
                                    <th>Montant</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {resultats.map((t) => {
                                        const isEntree = ['VENTE', 'REVENU'].includes(t.type_transaction);
                                        return (
                                            <tr key={t.id}>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                    {t.date_transaction}
                                                </td>
                                                <td>
                                                    <span className={`badge-pill ${isEntree ? 'success' : 'danger'}`}>
                                                        {t.type_transaction}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                    {t.description || "Transaction"}
                                                </td>
                                                <td>
                                                    <span className="payment-mode-pill">{t.mode_paiement}</span>
                                                </td>
                                                <td style={{ fontWeight: 700, color: isEntree ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
                                                    {isEntree ? '+' : '-'} {parseFloat(t.montant).toLocaleString()} FCFA
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        {t.justificatif_photo && (
                                                            <a 
                                                                href={t.justificatif_photo} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="badge-pill info"
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                Reçu
                                                            </a>
                                                        )}
                                                        <button 
                                                            className="action-btn-del" 
                                                            onClick={() => supprimer(t.id)}
                                                            title="Supprimer la transaction"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </AnimatePresence>
                                {resultats.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-state" style={{ background: 'transparent' }}>
                                            Aucune transaction trouvée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* MODAL TRANSACTION */}
            <AnimatePresence>
                {modal && (
                    <div className="modal-overlay glass-overlay">
                        <motion.div
                            className="modal-content premium-card"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <button className="close-modal-btn" onClick={() => setModal(false)}>
                                <FaTimes />
                            </button>
                            
                            <h2>Nouvelle Transaction</h2>
                            
                            <form onSubmit={enregistrer} className="premium-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Type de transaction</label>
                                        <select className="premium-input" name="type_transaction" value={form.type_transaction} onChange={handleChange}>
                                            <option value="VENTE">Vente (Entrée)</option>
                                            <option value="REVENU">Revenu (Entrée)</option>
                                            <option value="ACHAT">Achat (Sortie)</option>
                                            <option value="DEPENSE">Dépense (Sortie)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            className="premium-input"
                                            type="date"
                                            name="date_transaction"
                                            value={form.date_transaction}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split("T")[0]}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description / Motif</label>
                                        <input
                                            className="premium-input"
                                            name="description"
                                            placeholder="Ex: Vente de 50 sacs de maïs..."
                                            value={form.description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Montant (FCFA)</label>
                                        <input
                                            className="premium-input"
                                            type="number"
                                            name="montant"
                                            value={form.montant}
                                            onChange={handleChange}
                                            min="0"
                                            step="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mode de paiement</label>
                                        <select className="premium-input" name="mode_paiement" value={form.mode_paiement} onChange={handleChange}>
                                            <option value="CASH">Espèces</option>
                                            <option value="MOBILE_MONEY">Mobile Money</option>
                                            <option value="VIREMENT">Virement Bancaire</option>
                                            <option value="CHEQUE">Chèque</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group" style={{ marginTop: '15px' }}>
                                    <label>Justificatif (Optionnel)</label>
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary">Valider</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Transactions;