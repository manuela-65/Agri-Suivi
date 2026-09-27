import React, { useState, useEffect } from "react";
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaUserTie,
    FaPhone,
    FaEnvelope,
    FaBriefcase,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaUsers,
    FaTimes,
    FaChevronRight,
    FaUserCheck,
    FaUserTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EmployesService } from "../api/apiClient";
import "../Styles/Employes.css";

function Employes() {
    const navigate = useNavigate();
    const [employes, setEmployes] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        poste: "",
        telephone: "",
        email: "",
        salaire_mensuel: "",
        date_embauche: "",
        statut: "ACTIF"
    });

    useEffect(() => {
        loadEmployes();
    }, []);

    const loadEmployes = async () => {
        try {
            setLoading(true);
            const data = await EmployesService.getAll();
            setEmployes(data || []);
        } catch (error) {
            console.error("Erreur chargement employés", error);
            toast.error("Impossible de charger les employés.");
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

    const resetForm = () => {
        setForm({
            nom: "",
            prenom: "",
            poste: "",
            telephone: "",
            email: "",
            salaire_mensuel: "",
            date_embauche: "",
            statut: "ACTIF"
        });
        setEditId(null);
    };

    const ouvrirModal = () => {
        resetForm();
        setModal(true);
    };

    const modifier = (emp, e) => {
        e.stopPropagation();
        setEditId(emp.id);
        setForm({
            nom: emp.nom || "",
            prenom: emp.prenom || "",
            poste: emp.poste || "",
            telephone: emp.telephone || "",
            email: emp.email || "",
            salaire_mensuel: emp.salaire_mensuel || "",
            date_embauche: emp.date_embauche || "",
            statut: emp.statut || "ACTIF"
        });
        setModal(true);
    };

    const supprimer = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
        try {
            await EmployesService.delete(id);
            toast.success("Employé supprimé !");
            loadEmployes();
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const toggleStatut = async (emp, e) => {
        e.stopPropagation();
        const nouveauStatut = emp.statut === "ACTIF" ? "INACTIF" : "ACTIF";
        try {
            await EmployesService.update(emp.id, { ...emp, statut: nouveauStatut });
            toast.success(`Employé ${nouveauStatut.toLowerCase()} avec succès.`);
            loadEmployes();
        } catch (error) {
            console.error("Erreur toggle statut", error);
            toast.error("Erreur lors de la modification du statut.");
        }
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await EmployesService.update(editId, form);
                toast.success("Employé mis à jour avec succès.");
            } else {
                await EmployesService.create(form);
                toast.success("Employé ajouté avec succès !");
            }
            setModal(false);
            loadEmployes();
        } catch (error) {
            console.error("Erreur sauvegarde", error);
            toast.error("Erreur lors de la sauvegarde.");
        }
    };

    const filteredEmployes = employes.filter((emp) => {
        const full = `${emp.nom} ${emp.prenom} ${emp.poste}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    return (
        <div className="premium-employes">
            {/* HERO */}
            <motion.div 
                className="page-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-hero-content">
                    <h1>Gestion des Employés</h1>
                    <p>Gérez votre équipe, leurs contrats et suivez leurs activités.</p>
                </div>
                
                <button className="btn btn-primary" onClick={ouvrirModal}>
                    <FaPlus /> Ajouter un employé
                </button>
            </motion.div>

            {/* TOOLBAR */}
            <div className="toolbar premium-card">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        className="premium-input"
                        placeholder="Rechercher par nom, prénom ou poste..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement des employés...</p>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filteredEmployes.length === 0 && (
                <motion.div 
                    className="empty-state premium-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="empty-icon"><FaUsers /></div>
                    <h2>Aucun employé trouvé</h2>
                    <p>Commencez par ajouter les membres de votre équipe.</p>
                    <button className="btn btn-primary" onClick={ouvrirModal}>
                        <FaPlus /> Ajouter un employé
                    </button>
                </motion.div>
            )}

            {/* GRID */}
            {!loading && filteredEmployes.length > 0 && (
                <div className="employes-grid">
                    {filteredEmployes.map((emp, index) => (
                        <motion.div
                            key={emp.id}
                            className="employe-card premium-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/employe/${emp.id}`)}
                        >
                            <div className="emp-card-header">
                                <div className="emp-avatar">
                                    {emp.prenom?.charAt(0)}{emp.nom?.charAt(0)}
                                </div>
                                <div className="emp-actions">
                                    <button 
                                        className={`icon-btn ${emp.statut === 'ACTIF' ? 'deactivate-btn' : 'activate-btn'}`} 
                                        onClick={(e) => toggleStatut(emp, e)}
                                        title={emp.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                                    >
                                        {emp.statut === 'ACTIF' ? <FaUserTimes /> : <FaUserCheck />}
                                    </button>
                                    <button className="icon-btn edit-btn" onClick={(e) => modifier(emp, e)} title="Modifier">
                                        <FaEdit />
                                    </button>
                                    <button className="icon-btn delete-btn" onClick={(e) => supprimer(emp.id, e)} title="Supprimer">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div className="emp-card-body">
                                <h3>{emp.prenom} {emp.nom}</h3>
                                <span className={`status-badge ${emp.statut.toLowerCase()}`}>
                                    {emp.statut}
                                </span>
                                
                                <div className="emp-details">
                                    <p><FaBriefcase /> {emp.poste}</p>
                                    <p><FaPhone /> {emp.telephone || "Non renseigné"}</p>
                                    <p><FaEnvelope /> {emp.email || "Non renseigné"}</p>
                                </div>
                            </div>
                            
                            <div className="emp-card-footer">
                                <span>Voir le profil complet</span>
                                <FaChevronRight />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

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
                            
                            <h2>{editId ? "Modifier l'employé" : "Ajouter un employé"}</h2>
                            
                            <form onSubmit={enregistrer} className="premium-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Prénom</label>
                                        <input
                                            className="premium-input"
                                            name="prenom"
                                            value={form.prenom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input
                                            className="premium-input"
                                            name="nom"
                                            value={form.nom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Poste occupé</label>
                                        <input
                                            className="premium-input"
                                            name="poste"
                                            placeholder="Ex: Tractoriste, Chef d'équipe"
                                            value={form.poste}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Téléphone</label>
                                        <input
                                            className="premium-input"
                                            type="tel"
                                            name="telephone"
                                            value={form.telephone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            className="premium-input"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Date d'embauche</label>
                                        <input
                                            className="premium-input"
                                            type="date"
                                            name="date_embauche"
                                            value={form.date_embauche}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split("T")[0]}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Salaire (FCFA)</label>
                                        <input
                                            className="premium-input"
                                            type="number"
                                            name="salaire_mensuel"
                                            value={form.salaire_mensuel}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Statut</label>
                                        <select
                                            className="premium-input"
                                            name="statut"
                                            value={form.statut}
                                            onChange={handleChange}
                                        >
                                            <option value="ACTIF">Actif</option>
                                            <option value="INACTIF">Inactif</option>
                                            <option value="CONGE">En Congé</option>
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

export default Employes;