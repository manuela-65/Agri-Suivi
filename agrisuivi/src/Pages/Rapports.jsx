import React, { useState, useEffect, useMemo } from "react";
import {
  FaFilePdf,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaBuilding,
  FaSpinner
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FinancesService, EmployesService, ParametresService } from "../api/apiClient";
import "../Styles/Rapports.css";

function Rapports() {
    // Initialisation par défaut : mois en cours
    const getDefaultDates = () => {
        const now = new Date();
        const debut = new Date(now.getFullYear(), now.getMonth(), 1);
        const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            debut: debut.toISOString().split("T")[0],
            fin: fin.toISOString().split("T")[0]
        };
    };
    const defaultDates = getDefaultDates();
    const [dateDebut, setDateDebut] = useState(defaultDates.debut);
    const [dateFin, setDateFin] = useState(defaultDates.fin);
    const [erreurDate, setErreurDate] = useState("");
    const [activePeriod, setActivePeriod] = useState("mois");
    
    const [transactions, setTransactions] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [parametres, setParametres] = useState(null);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [trans, emps, params] = await Promise.all([
                FinancesService.getAll(),
                EmployesService.getAll(),
                ParametresService.getParams()
            ]);
            setTransactions(trans || []);
            setEmployes(emps || []);
            setParametres(params || { nom: "AgriSuivi", proprietaire: "" });
        } catch (error) {
            console.error("Erreur chargement des données pour rapports", error);
            toast.error("Impossible de charger les données pour les rapports.");
        } finally {
            setLoadingData(false);
        }
    };

    const filtrerPeriode = (type) => {
        const aujourd = new Date();
        let debut = new Date();
        let fin = new Date();

        if (type === "jour") {
            debut = aujourd;
            fin = aujourd;
        } else if (type === "semaine") {
            const jour = aujourd.getDay();
            const difference = jour === 0 ? 6 : jour - 1;
            debut = new Date(aujourd.setDate(aujourd.getDate() - difference));
            fin = new Date(debut);
            fin.setDate(fin.getDate() + 6);
        } else if (type === "mois") {
            debut = new Date(aujourd.getFullYear(), aujourd.getMonth(), 1);
            fin = new Date(aujourd.getFullYear(), aujourd.getMonth() + 1, 0);
        } else if (type === "annee") {
            debut = new Date(aujourd.getFullYear(), 0, 1);
            fin = new Date(aujourd.getFullYear(), 11, 31);
        }

        setActivePeriod(type);
        setDateDebut(debut.toISOString().split("T")[0]);
        setDateFin(fin.toISOString().split("T")[0]);
    };

    const transactionsFiltrees = useMemo(() => {
        if (!dateDebut || !dateFin) return transactions;
        const dDebut = new Date(dateDebut);
        const dFin = new Date(dateFin);
        dFin.setHours(23, 59, 59, 999);
        return transactions.filter(t => {
            const dateT = new Date(t.date_transaction);
            return dateT >= dDebut && dateT <= dFin;
        });
    }, [transactions, dateDebut, dateFin]);

    const statsGlobales = useMemo(() => {
        const recettes = transactionsFiltrees
            .filter(t => ['VENTE', 'REVENU'].includes(t.type_transaction))
            .reduce((sum, t) => sum + parseFloat(t.montant), 0);
        
        const depenses = transactionsFiltrees
            .filter(t => ['ACHAT', 'DEPENSE'].includes(t.type_transaction))
            .reduce((sum, t) => sum + parseFloat(t.montant), 0);

        return {
            recettes,
            depenses,
            benefice: recettes - depenses,
            nbTransactions: transactionsFiltrees.length,
            nbEmployes: employes.length
        };
    }, [transactionsFiltrees, employes]);

    const validerDates = () => {
        if (!dateDebut || !dateFin) {
            setErreurDate("Veuillez sélectionner une période.");
            return false;
        }
        if (new Date(dateDebut) > new Date(dateFin)) {
            setErreurDate("La date de début doit être avant la date de fin.");
            return false;
        }
        setErreurDate("");
        return true;
    };

    const genererRapportPDF = () => {
        if (!validerDates()) return;
        if (transactionsFiltrees.length === 0) {
            toast.error("Aucune transaction sur cette période.");
            return;
        }

        setIsGenerating(true);

        setTimeout(() => {
            const doc = new jsPDF();
            
            doc.setFillColor(22, 163, 74); 
            doc.rect(0, 0, 210, 40, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            const nomExploit = parametres?.nom || parametres?.nomExploitation || "Mon Exploitation";
            doc.text(nomExploit.toUpperCase(), 14, 25);

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("RAPPORT FINANCIER & PERFORMANCE", 14, 35);

            doc.setFontSize(10);
            doc.text(`Edité le : ${new Date().toLocaleDateString('fr-FR')}`, 150, 25);
            doc.text(`Période : ${new Date(dateDebut).toLocaleDateString('fr-FR')} - ${new Date(dateFin).toLocaleDateString('fr-FR')}`, 150, 32);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Résumé des Performances", 14, 55);

            const boxesY = 65;
            doc.setFillColor(220, 252, 231);
            doc.rect(14, boxesY, 55, 20, "F");
            doc.setFontSize(10);
            doc.text("Entrées Totales", 18, boxesY + 8);
            doc.setFontSize(12);
            doc.text(`${statsGlobales.recettes.toLocaleString()} FCFA`, 18, boxesY + 16);

            doc.setFillColor(254, 226, 226);
            doc.rect(77, boxesY, 55, 20, "F");
            doc.setFontSize(10);
            doc.text("Sorties Totales", 81, boxesY + 8);
            doc.setFontSize(12);
            doc.text(`${statsGlobales.depenses.toLocaleString()} FCFA`, 81, boxesY + 16);

            const benefColor = statsGlobales.benefice >= 0 ? [219, 234, 254] : [254, 243, 199];
            doc.setFillColor(...benefColor);
            doc.rect(140, boxesY, 55, 20, "F");
            doc.setFontSize(10);
            doc.text("Solde Net", 144, boxesY + 8);
            doc.setFontSize(12);
            doc.text(`${statsGlobales.benefice.toLocaleString()} FCFA`, 144, boxesY + 16);

            doc.setFontSize(16);
            doc.text("Détails des Transactions", 14, 100);

            const colonnes = ["Date", "Type", "Description", "Montant"];
            const lignes = transactionsFiltrees.map(t => [
                new Date(t.date_transaction).toLocaleDateString("fr-FR"),
                t.type_transaction,
                t.description,
                `${parseFloat(t.montant).toLocaleString()} FCFA`
            ]);

            autoTable(doc, {
                startY: 105,
                head: [colonnes],
                body: lignes,
                theme: "striped",
                headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
                styles: { fontSize: 10 },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`Page ${i} / ${pageCount} - Généré par AgriSuivi`, 105, 290, { align: "center" });
            }

            doc.save(`Rapport_${dateDebut}_${dateFin}.pdf`);
            setIsGenerating(false);
            toast.success("Rapport généré avec succès !");
        }, 1500); 
    };

    const genererRapportExcel = () => {
        if (!validerDates()) return;
        if (transactionsFiltrees.length === 0) {
            toast.error("Aucune transaction sur cette période.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(transactionsFiltrees.map(t => ({
            Date: new Date(t.date_transaction).toLocaleDateString("fr-FR"),
            Type: t.type_transaction,
            Description: t.description,
            Montant: t.montant
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, `Rapport_${dateDebut}_${dateFin}.xlsx`);
    };

    return (
        <div className="premium-rapports">
            {/* HERO */}
            <motion.div 
                className="page-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-hero-content">
                    <h1>Rapports & Statistiques</h1>
                    <p>Analysez les performances globales de votre exploitation.</p>
                </div>
            </motion.div>

            {loadingData ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement des données...</p>
                </div>
            ) : (
                <div className="rapports-content">
                    {/* FILTERS */}
                    <motion.div 
                        className="premium-card filters-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="filters-header">
                            <h2><FaCalendarAlt /> Période d'analyse</h2>
                            <p>Sélectionnez la période pour laquelle vous souhaitez générer le rapport.</p>
                        </div>
                        
                        <div className="period-presets">
                            <button className={`preset-btn ${activePeriod === 'jour' ? 'active' : ''}`} onClick={() => filtrerPeriode("jour")}>Aujourd'hui</button>
                            <button className={`preset-btn ${activePeriod === 'semaine' ? 'active' : ''}`} onClick={() => filtrerPeriode("semaine")}>Cette semaine</button>
                            <button className={`preset-btn ${activePeriod === 'mois' ? 'active' : ''}`} onClick={() => filtrerPeriode("mois")}>Ce mois</button>
                            <button className={`preset-btn ${activePeriod === 'annee' ? 'active' : ''}`} onClick={() => filtrerPeriode("annee")}>Cette année</button>
                        </div>

                        <div className="custom-date-range">
                            <div className="date-input-group">
                                <label>Date de début</label>
                                <input
                                    className="premium-input"
                                    type="date"
                                    value={dateDebut}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => { setDateDebut(e.target.value); setActivePeriod(null); }}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>Date de fin</label>
                                <input
                                    className="premium-input"
                                    type="date"
                                    value={dateFin}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => { setDateFin(e.target.value); setActivePeriod(null); }}
                                />
                            </div>
                        </div>
                        {erreurDate && <p className="error-message">{erreurDate}</p>}
                    </motion.div>

                    {/* PREVIEW */}
                    <AnimatePresence mode="wait">
                        {dateDebut && dateFin && (
                            <motion.div 
                                className="premium-card preview-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="preview-header">
                                    <h2><FaChartLine /> Aperçu des performances</h2>
                                </div>
                                
                                <div className="preview-stats">
                                    <div className="preview-stat-card">
                                        <span className="stat-label">Entrées Totales</span>
                                        <h3 className="stat-value text-success">{statsGlobales.recettes.toLocaleString()} FCFA</h3>
                                    </div>
                                    <div className="preview-stat-card">
                                        <span className="stat-label">Sorties Totales</span>
                                        <h3 className="stat-value text-danger">{statsGlobales.depenses.toLocaleString()} FCFA</h3>
                                    </div>
                                    <div className={`preview-stat-card ${statsGlobales.benefice >= 0 ? 'bg-primary-light' : 'bg-danger-light'}`}>
                                        <span className="stat-label">Solde Net</span>
                                        <h3 className={`stat-value ${statsGlobales.benefice >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            {statsGlobales.benefice.toLocaleString()} FCFA
                                        </h3>
                                    </div>
                                </div>

                                <div className="preview-info">
                                    <p><strong>{statsGlobales.nbTransactions}</strong> transactions ont été enregistrées au cours de cette période.</p>
                                </div>

                                <div className="generate-wrapper" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <button 
                                        className={`btn btn-primary btn-large generate-btn ${isGenerating ? 'generating' : ''}`}
                                        onClick={genererRapportPDF}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <><FaSpinner className="spin" /> Génération en cours...</>
                                        ) : (
                                            <><FaFilePdf /> Télécharger PDF</>
                                        )}
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-large generate-btn"
                                        onClick={genererRapportExcel}
                                    >
                                        Télécharger Excel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default Rapports;