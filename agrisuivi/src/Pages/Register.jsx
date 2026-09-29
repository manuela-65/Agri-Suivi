import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTransitionNavigate } from "../context/TransitionContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaBuilding,
  FaLeaf,
  FaArrowRight,
  FaArrowLeft,
  FaShieldAlt,
  FaStar,
  FaCheckCircle,
  FaTractor
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Register.css";

function Register() {
  const navigate = useTransitionNavigate();
  const { registerTenant } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    exploitation: "",
    schema_name: "",
    proprietaire: "",
    email: "",
    telephone: "",
    password: "",
    confirmation: "",
    type_exploitation: "MIXTE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "exploitation") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({
        ...prev,
        exploitation: value,
        schema_name: slug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!formData.schema_name) {
      toast.error("L'identifiant de l'exploitation est requis.");
      return;
    }

    setLoading(true);

    try {
      await registerTenant({
        farm_name: formData.exploitation,
        schema_name: formData.schema_name,
        owner_name: formData.proprietaire,
        email: formData.email,
        password: formData.password,
        phone: formData.telephone,
        type_exploitation: formData.type_exploitation,
      });

      toast.success(
        "Exploitation créée avec succès ! Vous pouvez vous connecter.",
        { duration: 5000 }
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* LEFT VISUAL PANEL */}
      <motion.div 
        className="auth-visual-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={{ backgroundImage: "url('/assets/greenhouse-sprouts.jpg')" }}
      >
        <div className="auth-visual-overlay" />
        
        {/* Brand link top */}
        <div className="auth-brand-top">
          <Link to="/" className="auth-brand-pill">
            <div className="brand-circle">
              <FaLeaf />
            </div>
            <span className="brand-text">AgriSuivi</span>
          </Link>
          <Link to="/" className="auth-back-link">
            <FaArrowLeft /> Retour au site
          </Link>
        </div>

        {/* Center Inspiration Text */}
        <div className="auth-visual-center">
          <div className="auth-tagline-badge">
            <span className="badge-live-dot" />
            Création d'Exploitation Sécurisée
          </div>
          <h1>Join Thousands of Modern Farming Pioneers.</h1>
          <p>
            Rejoignez des milliers de producteurs qui gèrent leurs cultures, troupeaux, stocks et équipes agricoles depuis une interface unique et ultra-performante.
          </p>
        </div>

        {/* Bottom Social Proof Card */}
        <div className="auth-social-proof-card">
          <div className="proof-header">
            <div className="stars-mini">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <strong>Essai 100% Gratuit</strong>
          </div>
          <p>« La traçabilité vidéo et la feuille de présence quotidienne ont complètement transformé notre organisation terrain. »</p>
          <div className="proof-footer">
            <span>Coopérative Maraîchère BioTerra</span>
            <span className="verified-tag"><FaCheckCircle /> Certifié</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT FORM PANEL */}
      <motion.div 
        className="auth-form-panel"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <div className="auth-form-container register-container">
          {/* Segmented Switch Pill */}
          <div className="auth-segmented-switch">
            <button 
              type="button" 
              className="switch-btn" 
              onClick={() => navigate("/login")}
            >
              Se connecter
            </button>
            <button type="button" className="switch-btn active">
              Créer un compte
            </button>
          </div>

          <div className="auth-form-header">
            <h2>Créer votre exploitation</h2>
            <p>Démarrez en quelques secondes sans carte bancaire.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-modern-form">
            {/* Ligne 1 : Nom et Type */}
            <div className="form-row-duo">
              <div className="auth-field-group">
                <label htmlFor="reg-farm">Nom de l'Exploitation</label>
                <div className="auth-input-wrapper">
                  <FaBuilding className="field-icon" />
                  <input
                    id="reg-farm"
                    type="text"
                    name="exploitation"
                    required
                    placeholder="Ex: Domaine de la Vallée"
                    value={formData.exploitation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-type">Type d'activité</label>
                <div className="auth-input-wrapper">
                  <FaTractor className="field-icon" />
                  <select
                    id="reg-type"
                    name="type_exploitation"
                    value={formData.type_exploitation}
                    onChange={handleChange}
                  >
                    <option value="MIXTE">Polyculture & Élevage (Mixte)</option>
                    <option value="CULTURES">Cultures Végétales</option>
                    <option value="ELEVAGE">Élevage / Cheptel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ligne 2 : Propriétaire et Téléphone */}
            <div className="form-row-duo">
              <div className="auth-field-group">
                <label htmlFor="reg-owner">Nom du Gérant / Propriétaire</label>
                <div className="auth-input-wrapper">
                  <FaUser className="field-icon" />
                  <input
                    id="reg-owner"
                    type="text"
                    name="proprietaire"
                    required
                    placeholder="Prénom et Nom"
                    value={formData.proprietaire}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-phone">Téléphone</label>
                <div className="auth-input-wrapper">
                  <FaPhone className="field-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    name="telephone"
                    placeholder="+237 600 00 00 00"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Ligne 3 : Email */}
            <div className="auth-field-group">
              <label htmlFor="reg-email">Adresse Email Principale</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  required
                  placeholder="contact@exploitation.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Ligne 4 : Mot de passe et Confirmation */}
            <div className="form-row-duo">
              <div className="auth-field-group">
                <label htmlFor="reg-password">Mot de passe</label>
                <div className="auth-input-wrapper">
                  <FaLock className="field-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Min. 6 caractères"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-confirm">Confirmation</label>
                <div className="auth-input-wrapper">
                  <FaLock className="field-icon" />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    name="confirmation"
                    required
                    placeholder="Confirmer mot de passe"
                    value={formData.confirmation}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? "Masquer" : "Afficher"}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="submit-loading-text">Création de l'exploitation...</span>
              ) : (
                <>
                  <span>Créer mon exploitation agricole</span>
                  <span className="btn-arrow-bubble"><FaArrowRight /></span>
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>
              Vous possédez déjà un compte ?{" "}
              <Link to="/login" className="highlight-link">
                Se connecter
              </Link>
            </p>
            <div className="security-notice">
              <FaShieldAlt /> Vos données sont protégées et isolées en base de données dédiée.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;