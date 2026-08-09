import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaPhone,
    FaEnvelope,
    FaUserTie,
    FaBriefcase,
    FaHistory,
    FaMoneyBillWave,
    FaCalendarAlt
} from "react-icons/fa";
import { motion } from "framer-motion";
import PageAnimation from "../Animations/PageAnimation";
import { EmployesService } from "../api/apiClient";
import toast from "react-hot-toast";
import "../Styles/Employes.css";

function DetailEmploye() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employe, setEmploye] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmploye();
    }, [id]);

    const loadEmploye = async () => {
        try {
            setLoading(true);
            const data = await EmployesService.getById(id);
            setEmploye(data);
        } catch (error) {
            console.error("Erreur chargement employé", error);
            toast.error("Employé introuvable ou erreur de chargement.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageAnimation>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement des détails...</p>
                </div>
            </PageAnimation>
        );
    }

    if (!employe) {
        return (
            <PageAnimation>
                <div className="empty-state premium-card">
                    <FaUserTie className="empty-icon" />
                    <h2>Employé introuvable</h2>
                    <button className="btn btn-primary" onClick={() => navigate("/employes")}>
                        <FaArrowLeft /> Retour aux employés
                    </button>
                </div>
            </PageAnimation>
        );
    }

    return (
        <PageAnimation>
            <div className="premium-employes">
                {/* TOOLBAR */}
                <div className="toolbar">
                    <button className="btn btn-secondary" onClick={() => navigate("/employes")}>
                        <FaArrowLeft /> Retour aux employés
                    </button>
                </div>

                {/* PROFILE HEADER */}
                <motion.div
                    className="emp-profile-header premium-card"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="emp-profile-avatar">
                        {employe.prenom?.charAt(0)}{employe.nom?.charAt(0)}
                    </div>
                    <div className="emp-profile-info">
                        <h1>{employe.prenom} {employe.nom}</h1>
                        <p><FaBriefcase /> {employe.poste}</p>
                        <span className={`status-badge ${employe.statut?.toLowerCase()}`}>
                            {employe.statut}
                        </span>
                    </div>
                </motion.div>

                {/* PROFILE DETAILS GRID */}
                <div className="emp-details-grid">
                    <motion.div 
                        className="emp-details-card premium-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3>Informations de Contact</h3>
                        <div className="emp-info-list">
                            <div className="emp-info-item">
                                <div className="info-icon"><FaPhone /></div>
                                <div className="info-text">
                                    <span>Téléphone</span>
                                    <strong>{employe.telephone || "Non renseigné"}</strong>
                                </div>
                            </div>
                            <div className="emp-info-item">
                                <div className="info-icon"><FaEnvelope /></div>
                                <div className="info-text">
                                    <span>Email</span>
                                    <strong>{employe.email || "Non renseigné"}</strong>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="emp-details-card premium-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>Détails du Contrat</h3>
                        <div className="emp-info-list">
                            <div className="emp-info-item">
                                <div className="info-icon"><FaCalendarAlt /></div>
                                <div className="info-text">
                                    <span>Date d'embauche</span>
                                    <strong>{employe.date_embauche || "Non renseigné"}</strong>
                                </div>
                            </div>
                            <div className="emp-info-item">
                                <div className="info-icon"><FaMoneyBillWave /></div>
                                <div className="info-text">
                                    <span>Salaire mensuel</span>
                                    <strong>{employe.salaire_mensuel ? `${employe.salaire_mensuel} FCFA` : "Non renseigné"}</strong>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ACTIVITY HISTORY */}
                <motion.div
                    className="emp-history premium-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="history-header">
                        <h2><FaHistory /> Historique d'activités</h2>
                    </div>
                    <div className="history-list">
                        <div className="empty-history">
                            <p>Aucune activité enregistrée pour le moment</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageAnimation>
    );
}

export default DetailEmploye;