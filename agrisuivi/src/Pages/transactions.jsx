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
            const [transData, bilanData] = await Promise.all([
                FinancesService.getAll(),
                FinancesService.getBilan()
            ]);
            setTransactions(transData || []);
            if (bilanData) {
                setBilan({
                    total_recettes: (parseFloat(bilanData.total_ventes) || 0) + (parseFloat(bilanData.total_revenus) || 0),
                    total_depenses: (parseFloat(bilanData.total_achats) || 0) + (parseFloat(bilanData.total_depenses) || 0),
                    solde_net: parseFloat(bilanData.solde_net) || 0
                });
            }
        } catch (error) {
            console.error("Erreur chargement transactions", error);
            toast.error("Impossible de charger les transactions.");
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
            <motion.div 
                className="page-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-hero-content">
                    <h1>Répartition Financière</h1>
                    <p>Suivi des revenus et des dépenses de l'exploitation.</p>
                </div>
                
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                    <FaPlus /> Nouvelle Transaction
                </button>
            </motion.div>

            {/* KPI STATS */}
            <div className="kpi-bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto' }}>
                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "var(--success)", backgroundColor: "var(--success-light)" }}>
                            <FaArrowUp />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{bilan.total_recettes.toLocaleString()} FCFA</h3>
                        <p>Entrées Totales</p>
                    </div>
                </motion.div>

                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "var(--danger)", backgroundColor: "var(--danger-light)" }}>
                            <FaArrowDown />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{bilan.total_depenses.toLocaleString()} FCFA</h3>
                        <p>Sorties Totales</p>
                    </div>
                </motion.div>

                <motion.div className={`kpi-small-card premium-card`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: bilan.solde_net >= 0 ? "var(--primary)" : "var(--danger)", backgroundColor: bilan.solde_net >= 0 ? "var(--primary-light)" : "var(--danger-light)" }}>
                            <FaMoneyBillWave />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{bilan.solde_net.toLocaleString()} FCFA</h3>
                        <p>Solde Net</p>
                    </div>
                </motion.div>
            </div>

            {/* CHART */}
            <motion.div 
                className="premium-card chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="chart-header">
                    <h2><FaChartPie /> Répartition Entrées / Sorties</h2>
                </div>
                {bilan.total_recettes === 0 && bilan.total_depenses === 0 ? (
                    <div className="empty-state">Aucune donnée financière pour l'instant.</div>
                ) : (
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={COLORS.entrees} />
                                    <Cell fill={COLORS.sorties} />
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `${value.toLocaleString()} FCFA`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot entrees"></span> Entrées</span>
                            <span className="legend-item"><span className="dot sorties"></span> Sorties</span>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* TABLE AND FILTERS */}
            <motion.div 
                className="production-container premium-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="table-header">
                    <h2>Historique des Transactions</h2>
                    <div className="table-actions">
                        <div className="search-box" style={{ maxWidth: '300px' }}>
                            <FaSearch className="search-icon" />
                            <input
                                className="premium-input"
                                placeholder="Rechercher..."
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                            />
                        </div>
                        <div className="filter-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filtre} 
                                onChange={(e) => setFiltre(e.target.value)} 
                                className="premium-input filter-select"
                            >
                                <option value="Tous">Toutes les transactions</option>
                                <option value="Entrée">Entrées</option>
                                <option value="Sortie">Sorties</option>
                            </select>
                            <button className="btn-secondary" onClick={exportPDF}>Export PDF</button>
                            <button className="btn-secondary" onClick={exportExcel}>Export Excel</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des transactions...</p>
                    </div>
                ) : (
                    <div className="premium-table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Mode Paiement</th>
                                    <th>Montant</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {resultats.map((t, index) => {
                                        const isEntree = ['VENTE', 'REVENU'].includes(t.type_transaction);
                                        return (
                                            <motion.tr 
                                                key={t.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <td>{t.date_transaction}</td>
                                                <td>
                                                    <span className={`type-badge ${isEntree ? 'entree' : 'sortie'}`}>
                                                        {t.type_transaction}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--text-main)', transition: 'all 0.3s' }}>{t.description || "Transaction"}</td>
                                                <td>{t.mode_paiement}</td>
                                                <td style={{ fontWeight: 700, color: isEntree ? 'var(--success)' : 'var(--danger)' }}>
                                                    {isEntree ? '+' : '-'} {parseFloat(t.montant).toLocaleString()} FCFA
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-icon delete" onClick={() => supprimer(t.id)}>
                                                            <FaTrash />
                                                        </button>
                                                        {t.justificatif_photo && (
                                                            <a href={t.justificatif_photo} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#16a34a' }}>
                                                                Voir Justificatif
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                                {resultats.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-row">Aucune transaction trouvée.</td>
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