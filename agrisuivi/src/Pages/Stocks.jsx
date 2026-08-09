import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaBoxes,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaTimes,
  FaFilter
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { StocksService } from "../api/apiClient";
import "../Styles/Stocks.css";

function Stocks() {
    const [modal, setModal] = useState(false);
    const [mouvementModal, setMouvementModal] = useState(false);
    const [recherche, setRecherche] = useState("");
    const [filtre, setFiltre] = useState("Tous");
    const [loading, setLoading] = useState(true);

    const [stocks, setStocks] = useState([]);
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        type_article: "INTRANT",
        quantite_en_stock: "",
        seuil_alerte: "10",
        unite_mesure: "kg",
        prix_unitaire_moyen: "",
        emplacement: ""
    });

    const [mouvementForm, setMouvementForm] = useState({
        type_mouvement: "ENTREE",
        quantite: "",
        prix_total: "",
        motif: ""
    });

    useEffect(() => {
        loadStocks();
    }, []);

    const loadStocks = async () => {
        try {
            setLoading(true);
            const data = await StocksService.getAll();
            setStocks(data || []);
        } catch (error) {
            console.error("Erreur chargement stocks", error);
            toast.error("Impossible de charger les stocks.");
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

    const handleMouvementChange = (e) => {
        setMouvementForm({
            ...mouvementForm,
            [e.target.name]: e.target.value
        });
    };

    const enregistrerArticle = async (e) => {
        e.preventDefault();
        try {
            await StocksService.create({
                ...form,
                quantite_en_stock: form.quantite_en_stock ? parseFloat(form.quantite_en_stock) : 0,
                prix_unitaire_moyen: form.prix_unitaire_moyen ? parseFloat(form.prix_unitaire_moyen) : 0,
                seuil_alerte: form.seuil_alerte ? parseFloat(form.seuil_alerte) : 0
            });
            toast.success("Article ajouté au stock !");
            setModal(false);
            setForm({ nom: "", type_article: "INTRANT", quantite_en_stock: "", seuil_alerte: "10", unite_mesure: "kg", prix_unitaire_moyen: "", emplacement: "" });
            loadStocks();
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'article.");
        }
    };

    const enregistrerMouvement = async (e) => {
        e.preventDefault();
        try {
            await StocksService.addMouvement({
                article: selectedArticleId,
                ...mouvementForm,
                quantite: mouvementForm.quantite ? parseFloat(mouvementForm.quantite) : 0,
                prix_total: mouvementForm.prix_total ? parseFloat(mouvementForm.prix_total) : 0
            });
            toast.success("Mouvement enregistré !");
            setMouvementModal(false);
            setMouvementForm({ type_mouvement: "ENTREE", quantite: "", prix_total: "", motif: "" });
            loadStocks();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement du mouvement.");
        }
    };

    const supprimer = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
            try {
                await StocksService.delete(id);
                toast.success("Article supprimé !");
                loadStocks();
            } catch (error) {
                console.error("Erreur de suppression:", error);
                toast.error("Impossible de supprimer cet article.");
            }
        }
    };

    const resultats = stocks.filter(stock => {
        const matchRecherche = stock.nom.toLowerCase().includes(recherche.toLowerCase());
        const matchFiltre = filtre === "Tous" || stock.type_article === filtre;
        return matchRecherche && matchFiltre;
    });

    const nbAlertes = stocks.filter(s => parseFloat(s.quantite_en_stock) <= parseFloat(s.seuil_alerte)).length;
    const valeurTotale = stocks.reduce((acc, curr) => acc + (parseFloat(curr.quantite_en_stock) * parseFloat(curr.prix_unitaire_moyen)), 0);

    return (
        <div className="premium-stocks">
            {/* HERO */}
            <motion.div 
                className="page-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-hero-content">
                    <h1>Gestion des Stocks</h1>
                    <p>Contrôlez vos ressources, intrants et récoltes.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                    <FaPlus /> Nouvel Article
                </button>
            </motion.div>

            {/* KPI STATS */}
            <div className="kpi-bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto' }}>
                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)" }}>
                            <FaBoxes />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{stocks.length}</h3>
                        <p>Articles Référencés</p>
                    </div>
                </motion.div>

                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "var(--danger)", backgroundColor: "var(--danger-light)" }}>
                            <FaExclamationTriangle />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{nbAlertes}</h3>
                        <p>Alertes de Stock</p>
                    </div>
                </motion.div>

                <motion.div className="kpi-small-card premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="kpi-icon-header">
                        <div className="kpi-icon" style={{ color: "#0284c7", backgroundColor: "#e0f2fe" }}>
                            <FaExchangeAlt />
                        </div>
                    </div>
                    <div className="kpi-content">
                        <h3>{valeurTotale.toLocaleString()} FCFA</h3>
                        <p>Valeur Estimée</p>
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
                    <h2>Inventaire</h2>
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
                                <option value="Tous">Tous les types</option>
                                <option value="INTRANT">Intrant</option>
                                <option value="RECOLTE">Récolte</option>
                                <option value="EQUIPEMENT">Équipement</option>
                                <option value="ALIMENTATION">Alimentation</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement de l'inventaire...</p>
                    </div>
                ) : (
                    <div className="premium-table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Type</th>
                                    <th>Emplacement</th>
                                    <th>Quantité</th>
                                    <th>Prix Unitaire</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultats.map((stock) => {
                                    const enAlerte = parseFloat(stock.quantite_en_stock) <= parseFloat(stock.seuil_alerte);
                                    return (
                                        <tr key={stock.id}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stock.nom}</td>
                                            <td>
                                                <span className={`type-badge`}>
                                                    {stock.type_article}
                                                </span>
                                            </td>
                                            <td>{stock.emplacement || "-"}</td>
                                            <td style={{ fontWeight: 600, color: enAlerte ? 'var(--danger)' : 'inherit' }}>
                                                {stock.quantite_en_stock} {stock.unite_mesure}
                                            </td>
                                            <td>{parseFloat(stock.prix_unitaire_moyen).toLocaleString()} FCFA</td>
                                            <td>
                                                {enAlerte ? (
                                                    <span className="status-badge alert" style={{ margin: 0 }}>Stock critique</span>
                                                ) : (
                                                    <span className="status-badge ok" style={{ margin: 0 }}>Disponible</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button 
                                                        className="icon-btn edit-btn" 
                                                        onClick={() => { setSelectedArticleId(stock.id); setMouvementModal(true); }}
                                                        title="Ajouter un mouvement (Entrée/Sortie)"
                                                    >
                                                        <FaExchangeAlt />
                                                    </button>
                                                    <button className="icon-btn delete-btn" onClick={() => supprimer(stock.id)} title="Supprimer">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {resultats.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-row">Aucun article trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* MODAL ARTICLE */}
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
                            
                            <h2>Nouvel Article en Stock</h2>
                            
                            <form onSubmit={enregistrerArticle} className="premium-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nom de l'article</label>
                                        <input className="premium-input" name="nom" placeholder="Ex: Engrais NPK" value={form.nom} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Type d'article</label>
                                        <select className="premium-input" name="type_article" value={form.type_article} onChange={handleChange}>
                                            <option value="INTRANT">Intrant</option>
                                            <option value="RECOLTE">Récolte</option>
                                            <option value="EQUIPEMENT">Équipement</option>
                                            <option value="ALIMENTATION">Alimentation</option>
                                            <option value="AUTRE">Autre</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quantité Initiale</label>
                                        <input className="premium-input" type="number" name="quantite_en_stock" value={form.quantite_en_stock} onChange={handleChange} min="0" step="0.01" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Unité de mesure</label>
                                        <input className="premium-input" name="unite_mesure" placeholder="ex: kg, Sacs, Litres" value={form.unite_mesure} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Prix Unitaire Moyen (FCFA)</label>
                                        <input className="premium-input" type="number" name="prix_unitaire_moyen" value={form.prix_unitaire_moyen} onChange={handleChange} min="0" step="1" />
                                    </div>
                                    <div className="form-group">
                                        <label>Seuil d'alerte (Qté Mini)</label>
                                        <input className="premium-input" type="number" name="seuil_alerte" value={form.seuil_alerte} onChange={handleChange} min="0" step="0.01" />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Emplacement (Magasin / Hangar)</label>
                                        <input className="premium-input" name="emplacement" value={form.emplacement} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary">Créer l'article</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL MOUVEMENT */}
            <AnimatePresence>
                {mouvementModal && (
                    <div className="modal-overlay glass-overlay">
                        <motion.div
                            className="modal-content premium-card"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <button className="close-modal-btn" onClick={() => setMouvementModal(false)}>
                                <FaTimes />
                            </button>
                            
                            <h2>Enregistrer un mouvement</h2>
                            
                            <form onSubmit={enregistrerMouvement} className="premium-form">
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Type de mouvement</label>
                                        <select className="premium-input" name="type_mouvement" value={mouvementForm.type_mouvement} onChange={handleMouvementChange}>
                                            <option value="ENTREE">Entrée en stock (+)</option>
                                            <option value="SORTIE">Sortie / Utilisation (-)</option>
                                            <option value="PERTE">Perte / Avarie (-)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quantité</label>
                                        <input className="premium-input" type="number" name="quantite" value={mouvementForm.quantite} onChange={handleMouvementChange} min="0.01" step="0.01" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Coût Total (FCFA)</label>
                                        <input className="premium-input" type="number" name="prix_total" value={mouvementForm.prix_total} onChange={handleMouvementChange} min="0" step="1" placeholder="Optionnel" />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Motif / Justification</label>
                                        <input className="premium-input" name="motif" placeholder="Ex: Achat chez fournisseur..." value={mouvementForm.motif} onChange={handleMouvementChange} required />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMouvementModal(false)}>Annuler</button>
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

export default Stocks;