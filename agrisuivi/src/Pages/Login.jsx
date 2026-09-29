import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTransitionNavigate } from "../context/TransitionContext";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaLeaf,
  FaShieldAlt,
  FaStar,
  FaCheckCircle,
  FaArrowLeft
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";

function Login() {
  const navigate = useTransitionNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();
    setLoading(true);

    try {
      const data = await login(normalizedEmail, formData.password);
      toast.success("Bienvenue sur AgriSuivi !");

      const role = data?.user?.role || "PROPRIETAIRE";
      if (role === "ADMIN_PLATFORME") {
        navigate("/super-admin", { fullScreen: true });
      } else if (role === "EMPLOYE") {
        navigate("/employe-dashboard", { fullScreen: true });
      } else {
        navigate("/dashboard", { fullScreen: true });
      }
    } catch (error) {
      let msg = error.message || "";
      if (
        msg.toLowerCase().includes("no active account") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("credentials")
      ) {
        msg = "Email ou mot de passe incorrect.";
      } else if (msg.toLowerCase().includes("not found")) {
        msg = "Identifiant d'exploitation introuvable.";
      }
      toast.error(msg || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* LEFT VISUAL HERO PANEL (Landscape Style) */}
      <motion.div 
        className="auth-visual-panel"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={{ backgroundImage: "url('/assets/tractor-field.jpg')" }}
      >
        <div className="auth-visual-overlay" />
        
        {/* Top Brand Link */}
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
            Plateforme Cloud Multi-Tenant
          </div>
          <h1>Sustainable Agriculture, Intelligently Managed.</h1>
          <p>
            Connectez-vous pour piloter vos parcelles, superviser la santé de vos troupeaux, gérer les stocks d'intrants et certifier la traçabilité de chaque journée de travail.
          </p>
        </div>

        {/* Bottom Social Proof Card */}
        <div className="auth-social-proof-card">
          <div className="proof-header">
            <div className="stars-mini">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <strong>4.9 / 5</strong>
          </div>
          <p>« AgriSuivi nous fait gagner plus de 8 heures par semaine sur la gestion de nos équipes et de nos stocks. »</p>
          <div className="proof-footer">
            <span>Marc D., Exploitant Céréalier (350 Ha)</span>
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
        <div className="auth-form-container">
          {/* Segmented Switch Pill */}
          <div className="auth-segmented-switch">
            <button type="button" className="switch-btn active">
              Se connecter
            </button>
            <button 
              type="button" 
              className="switch-btn" 
              onClick={() => navigate("/register")}
            >
              Créer un compte
            </button>
          </div>

          <div className="auth-form-header">
            <h2>Bienvenue sur votre espace</h2>
            <p>Saisissez vos identifiants pour accéder à votre tableau de bord.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-modern-form">
            <div className="auth-field-group">
              <label htmlFor="login-email">Adresse Email</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  required
                  placeholder="nom@exploitation.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field-group">
              <div className="field-label-row">
                <label htmlFor="login-password">Mot de passe</label>
                <Link to="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <FaLock className="field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="submit-loading-text">Connexion en cours...</span>
              ) : (
                <>
                  <span>Accéder à mon exploitation</span>
                  <span className="btn-arrow-bubble"><FaArrowRight /></span>
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>
              Nouvel exploitant agricole ?{" "}
              <Link to="/register" className="highlight-link">
                Créer une exploitation gratuitement
              </Link>
            </p>
            <div className="security-notice">
              <FaShieldAlt /> Données cryptées et isolées selon l'architecture Multi-Tenant.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;