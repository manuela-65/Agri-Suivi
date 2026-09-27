import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaArrowRight, FaLeaf, FaKey } from "react-icons/fa";
import { motion } from "framer-motion";
import { AuthService } from "../api/apiClient";
import toast from "react-hot-toast";
import "../Pages/Login.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    token: "",
    new_password: "",
    tenant_schema: searchParams.get("tenant") || ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.token || !formData.new_password || !formData.tenant_schema) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      await AuthService.resetPasswordConfirm(
        { email: formData.email, token: formData.token, new_password: formData.new_password },
        formData.tenant_schema
      );
      toast.success("Votre mot de passe a été réinitialisé avec succès !");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Le code est invalide ou a expiré.");
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
          <h2>Nouveau mot de passe</h2>
          <p>
            Veuillez entrer le code à 6 chiffres reçu dans la console (ou par email) et définir votre nouveau mot de passe.
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
          <span className="badge">Réinitialisation</span>
          <h2>Créer un mot de passe</h2>
          <p className="subtitle">Validez le code et choisissez un mot de passe sécurisé.</p>

          <div className="input-group">
            <FaKey />
            <input
              type="text"
              name="token"
              placeholder="Code de validation (ex: 123456)"
              value={formData.token}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type={showPassword ? "text" : "password"}
              name="new_password"
              placeholder="Nouveau mot de passe"
              value={formData.new_password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <motion.button
            className="login-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            {loading ? "Validation..." : (
              <>
                Réinitialiser
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

export default ResetPassword;
