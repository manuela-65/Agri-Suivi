import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaBuilding, FaArrowRight, FaLeaf } from "react-icons/fa";
import { motion } from "framer-motion";
import { AuthService } from "../api/apiClient";
import toast from "react-hot-toast";
import "../Pages/Login.css";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    tenant_schema: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.tenant_schema) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      await AuthService.resetPasswordRequest(
        { email: formData.email, tenant_schema: formData.tenant_schema },
        formData.tenant_schema
      );
      toast.success("Un email avec les instructions a été envoyé (voir console backend pour simuler).", { duration: 5000 });
      // On redirige vers ResetPassword en passant l'email et le tenant pour faciliter l'UX
      setTimeout(() => {
        window.location.href = `/reset-password?email=${encodeURIComponent(formData.email)}&tenant=${encodeURIComponent(formData.tenant_schema)}`;
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-blur blur-one"></div>
      <div className="background-blur blur-two"></div>

      <motion.section
        className="login-left"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="overlay">
          <div className="logo-box">
            <div className="logo-circle">
              <FaLeaf />
            </div>
            <h1>AgriSuivi</h1>
          </div>
          <h2>Récupération de compte</h2>
          <p>
            Vous avez oublié votre mot de passe ? Entrez l'identifiant de votre exploitation et votre email. 
            Nous vous enverrons un lien pour le réinitialiser.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="login-right"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.form
          className="login-card"
          onSubmit={handleSubmit}
          whileHover={{ y: -4 }}
        >
          <span className="badge">Récupération</span>
          <h2>Mot de passe oublié</h2>
          <p className="subtitle">Recevez un lien de réinitialisation.</p>

          <div className="input-group">
            <FaBuilding />
            <input
              type="text"
              name="tenant_schema"
              placeholder="Identifiant de l'exploitation"
              value={formData.tenant_schema}
              onChange={handleChange}
            />
          </div>

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

          <motion.button
            className="login-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : (
              <>
                Envoyer le lien
                <FaArrowRight />
              </>
            )}
          </motion.button>

          <div className="divider">
            <span>ou</span>
          </div>

          <p className="register-text">Je me souviens de mon mot de passe.</p>
          <Link to="/login" className="register-btn">
            Retour à la connexion
          </Link>
        </motion.form>
      </motion.section>
    </div>
  );
}

export default ForgotPassword;
