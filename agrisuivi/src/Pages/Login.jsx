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
  FaChartLine,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../Pages/Login.css";

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
      const data = await login(
        normalizedEmail,
        formData.password
        // Ne pas passer de tenant - laisser le backend auto-détecter
      );

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
      // Traduire les messages Django JWT en français
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
    <div className="login-page">

      {/* Background animé */}
      <div className="background-blur blur-one"></div>
      <div className="background-blur blur-two"></div>

      {/* Partie gauche */}

      <motion.section
        className="login-left"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
        }}
      >
        <div className="overlay">

          <div className="logo-box">

            <div className="logo-circle">
              <FaLeaf />
            </div>

            <h1>AgriSuivi</h1>

          </div>

          <h2>
            Gérez votre exploitation agricole
            en toute simplicité.
          </h2>

          <p>
            Une plateforme SaaS intelligente permettant
            de gérer vos employés, vos exploitations,
            vos stocks, vos transactions et la
            traçabilité complète de toutes vos activités.
          </p>

          <div className="feature-card">
            <FaShieldAlt />
            <div>
              <h4>Sécurité Multi-Tenant</h4>
              <span>
                Chaque exploitation possède ses
                propres données sécurisées.
              </span>
            </div>
          </div>

          <div className="feature-card">
            <FaChartLine />
            <div>
              <h4>Suivi intelligent</h4>
              <span>
                Consultez vos statistiques en temps réel.
              </span>
            </div>
          </div>

          <div className="feature-card">
            <FaLeaf />
            <div>
              <h4>Traçabilité complète</h4>
              <span>
                Toutes les opérations sont enregistrées.
              </span>
            </div>
          </div>

          <div className="stats">

            <div className="stat">
              <h3>250+</h3>
              <p>Exploitations</p>
            </div>

            <div className="stat">
              <h3>1800+</h3>
              <p>Employés</p>
            </div>

            <div className="stat">
              <h3>99.9%</h3>
              <p>Disponibilité</p>
            </div>

          </div>

        </div>
      </motion.section>

      {/* Partie droite */}

      <motion.section
        className="login-right"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
        }}
      >
        <motion.form
          className="login-card"
          onSubmit={handleSubmit}
          whileHover={{
            y: -4,
          }}
        >
          <span className="badge">
            Connexion sécurisée
          </span>

          <h2>Bienvenue</h2>

          <p className="subtitle">
            Connectez-vous à votre espace AgriSuivi.
          </p>

          <div className="input-group">

            <FaEnvelope />

            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

          <div className="input-group">

            <FaLock />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="show-password"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          <motion.button
            className="login-btn"
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            disabled={loading}
          >
            {loading ? (
              "Connexion..."
            ) : (
              <>
                Se connecter
                <FaArrowRight />
              </>
            )}
          </motion.button>

          <div className="divider">
            <span>ou</span>
          </div>

          <p className="register-text">
            Vous êtes propriétaire ?
          </p>

          <Link
            to="/register"
            className="register-btn"
          >
            Créer une exploitation
          </Link>

        </motion.form>
      </motion.section>

    </div>
  );
}

export default Login;