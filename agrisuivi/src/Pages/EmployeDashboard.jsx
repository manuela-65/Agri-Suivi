import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaTasks, FaBoxes, FaClipboardList, FaChevronRight } from "react-icons/fa";
import "../Styles/Employes.css";

function EmployeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="premium-employes">
      {/* HERO */}
      <motion.header
        className="page-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="page-hero-content">
          <h1>Mon Espace de Travail</h1>
          <p>Exploitation active : {user?.tenant_schema || "Connecté"}</p>
        </div>
      </motion.header>

      {/* DASHBOARD CARDS */}
      <div className="employes-grid">
        <motion.div
          className="employe-card premium-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/taches")}
        >
          <div className="emp-card-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
             <div className="emp-avatar" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                <FaTasks />
             </div>
          </div>
          <div className="emp-card-body" style={{ paddingTop: '16px' }}>
            <h3>Mes tâches</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Consulter et mettre à jour l'état de mes activités agricoles.</p>
          </div>
          <div className="emp-card-footer">
            <span>Accéder aux tâches</span>
            <FaChevronRight />
          </div>
        </motion.div>

        <motion.div
          className="employe-card premium-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/stocks")}
        >
          <div className="emp-card-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
             <div className="emp-avatar" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                <FaBoxes />
             </div>
          </div>
          <div className="emp-card-body" style={{ paddingTop: '16px' }}>
            <h3>Gestion du stock</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Enregistrer les entrées et sorties de ressources.</p>
          </div>
          <div className="emp-card-footer">
            <span>Accéder au stock</span>
            <FaChevronRight />
          </div>
        </motion.div>

        <motion.div
          className="employe-card premium-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/tracabilite")}
        >
          <div className="emp-card-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
             <div className="emp-avatar" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
                <FaClipboardList />
             </div>
          </div>
          <div className="emp-card-body" style={{ paddingTop: '16px' }}>
            <h3>Traçabilité</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Voir l'historique complet des actions sur l'exploitation.</p>
          </div>
          <div className="emp-card-footer">
            <span>Voir l'historique</span>
            <FaChevronRight />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmployeDashboard;