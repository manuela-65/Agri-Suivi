import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaSeedling,
  FaTractor,
  FaCalendarAlt,
  FaLeaf,
  FaTimes,
  FaFilter
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { CulturesService } from "../api/apiClient";
import "../Styles/Cultures.css";

function Cultures() {
    const [modal, setModal] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [filtre, setFiltre] = useState("Tous");
    const [loading, setLoading] = useState(true);

    const [productions, setProductions] = useState([]);

    const [form, setForm] = useState({
        type: "Culture",
        nom: "",
        variete_ou_race: "",
        quantite_estimee: "",
        date_semis: "",
        statut: "PLANIFIE"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const cultures = await CulturesService.getCultures();
            const elevages = await CulturesService.getElevages();
            
            const formattedCultures = (cultures || []).map(c => ({
                id: c.id,
                type: "Culture",
                nom: c.variete.split(" - ")[0] || "Culture",
                variete_ou_race: c.variete.split(" - ")[1] || c.variete,
                quantite: c.rendement_estime,
                date: c.date_semis,
                statut: c.statut
            }));

            const formattedElevages = (elevages || []).map(e => ({
                id: e.id,
                type: "Élevage",
                nom: e.type_animaux.split(" - ")[0] || "Élevage",
                variete_ou_race: e.type_animaux.split(" - ")[1] || e.type_animaux,
                quantite: e.nombre_tetes,
                date: e.date_acquisition,
                statut: e.notes || "Bon"
            }));

            setProductions([...formattedCultures, ...formattedElevages]);
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement des données.");
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
            if (form.type === "Culture") {
                // S'assurer qu'on a au moins une parcelle pour y associer la culture
                let parcelles = await CulturesService.getParcelles();
                let parcelleId;
                if (!parcelles || parcelles.length === 0) {
                    const newParcelle = await CulturesService.createParcelle({ nom: "Parcelle Principale", superficie: 1 });
                    parcelleId = newParcelle.id;
                } else {
                    parcelleId = parcelles[0].id;
                }

                await CulturesService.createCulture({
                    parcelle: parcelleId,
                    variete: form.nom + (form.variete_ou_race ? " - " + form.variete_ou_race : ""),
                    rendement_estime: form.quantite_estimee || 0,
                    date_semis: form.date_semis,
                    statut: form.statut === "PLANIFIE" ? "EN_CROISSANCE" : (form.statut === "EN_COURS" ? "EN_CROISSANCE" : "TERMINEE"),
                    type_culture: "VIVRIERE",
                    quantite_semee: 0
                });
            } else {
                await CulturesService.createElevage({
                    type_animaux: form.nom + (form.variete_ou_race ? " - " + form.variete_ou_race : ""),
                    nombre_tetes: form.quantite_estimee || 0,
                    date_acquisition: form.date_semis,
                    statut_sanitaire: "Bon",
                    notes: form.statut
                });
            }
            
            toast.success(`${form.type} ajoutée avec succès !`);
            setModal(false);
            setForm({ type: "Culture", nom: "", variete_ou_race: "", quantite_estimee: "", date_semis: "", statut: "PLANIFIE" });
            loadData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement.");
        }
    };

    const supprimer = async (id, type) => {
        if (!window.confirm(`Supprimer cette ${type.toLowerCase()} ?`)) return;
        try {
            if (type === "Culture") {
                await CulturesService.deleteCulture(id);
            } else {
                await CulturesService.deleteElevage(id);
            }
            toast.success("Élément supprimé.");
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const resultats = productions.filter(prod => {
        const matchRecherche = `${prod.nom} ${prod.variete_ou_race}`.toLowerCase().includes(recherche.toLowerCase());
        const matchFiltre = filtre === "Tous" || prod.type === filtre;
        return matchRecherche && matchFiltre;
    });

    const nbCultures = productions.filter(p => p.type === "Culture").length;
    const nbElevages = productions.filter(p => p.type === "Élevage").length;

    return (
        <div className="premium-cultures">
            {/* HERO */}
            <motion.div 
                className="page-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-hero-content">
                    <h1>Cultures & Élevage</h1>
                    <p>Gérez les productions de votre exploitation.</p>
                </div>
                
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                    <FaPlus /> Nouvelle Production
                </button>
            </motion.div>

            {/* KPI STATS */}
            <div className="kpi-bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto' }}>
                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)" }}>
                            <FaLeaf />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{productions.length}</h3>
                        <p>Total Productions</p>
                    </div>
                </motion.div>

                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "#0284c7", backgroundColor: "#e0f2fe" }}>
                            <FaSeedling />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{nbCultures}</h3>
                        <p>Cultures en cours</p>
                    </div>
                </motion.div>

                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "#f59e0b", backgroundColor: "#fef3c7" }}>
                            <FaTractor />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{nbElevages}</h3>
                        <p>Élevages actifs</p>
                    </div>
                </motion.div>
            </div>

            {/* TABLE AND FILTERS */}
            <motion.div 
                className="production-container premium-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="table-header">
                    <h2>Liste des productions</h2>
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
                        <div className="filter-wrapper">
                            <FaFilter className="filter-icon" />
                            <select 
                                value={filtre} 
                                onChange={(e) => setFiltre(e.target.value)} 
                                className="premium-input filter-select"
                            >
                                <option value="Tous">Tous</option>
                                <option value="Culture">Cultures</option>
                                <option value="Élevage">Élevages</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des données...</p>
                    </div>
                ) : (
                    <div className="premium-table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Nom</th>
                                    <th>Variété / Race</th>
                                    <th>Quantité Estimée</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultats.map((prod) => (
                                    <tr key={`${prod.type}-${prod.id}`}>
                                        <td>
                                            <span className={`type-badge ${prod.type === 'Culture' ? 'culture' : 'elevage'}`}>
                                                {prod.type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{prod.nom}</td>
                                        <td>{prod.variete_ou_race || "-"}</td>
                                        <td>{prod.quantite}</td>
                                        <td>{prod.date || "-"}</td>
                                        <td>
                                            <span className={`status-badge ${prod.statut?.toLowerCase()}`} style={{ margin: 0 }}>
                                                {prod.statut}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="icon-btn delete-btn" onClick={() => supprimer(prod.id, prod.type)}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {resultats.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-row">Aucune production trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* MODAL */}
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
                            
                            <h2>Ajouter une production</h2>
                            
                            <form onSubmit={enregistrer} className="premium-form">
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Type de production</label>
                                        <select className="premium-input" name="type" value={form.type} onChange={handleChange}>
                                            <option value="Culture">Culture</option>
                                            <option value="Élevage">Élevage</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input
                                            className="premium-input"
                                            name="nom"
                                            placeholder="Ex: Maïs, Poulets..."
                                            value={form.nom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Variété / Race</label>
                                        <input
                                            className="premium-input"
                                            name="variete_ou_race"
                                            placeholder="Ex: Maïs jaune, Brahma..."
                                            value={form.variete_ou_race}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantité / Nombre (estimé)</label>
                                        <input
                                            className="premium-input"
                                            type="number"
                                            name="quantite_estimee"
                                            value={form.quantite_estimee}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FaCalendarAlt /> Date (Semis / Achat)</label>
                                        <input
                                            className="premium-input"
                                            type="date"
                                            name="date_semis"
                                            value={form.date_semis}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split("T")[0]}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Statut</label>
                                        <select className="premium-input" name="statut" value={form.statut} onChange={handleChange}>
                                            <option value="PLANIFIE">Planifié</option>
                                            <option value="EN_COURS">En cours</option>
                                            <option value="TERMINE">Terminé</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Cultures;
