import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../api/apiClient";
import toast from "react-hot-toast";
import { FaUser, FaPhone, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import "../Styles/Profile.css";

function Profile() {
  const { user, refreshSettings } = useAuth(); // On peut rappeler refreshSettings pour propager un chgt de nom éventuel
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });

  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await AuthService.updateProfile(profileData);
      toast.success("Profil mis à jour avec succès.");
      // Mettre à jour l'utilisateur dans le local storage et potentiellement le state
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updatedUser }));
      // reload the page to refresh context
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.old_password || !passwordData.new_password) {
      toast.error("Veuillez remplir les deux champs de mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await AuthService.apiFetch("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify(passwordData)
      });
      toast.success("Mot de passe modifié avec succès.");
      setPasswordData({ old_password: "", new_password: "" });
    } catch (error) {
      toast.error(error.message || "Erreur lors de la modification du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!profileData.phone) {
      toast.error("Veuillez d'abord enregistrer un numéro de téléphone.");
      return;
    }
    setOtpLoading(true);
    try {
      await AuthService.sendPhoneOTP();
      toast.success("Code de vérification envoyé (voir console).", { duration: 4000 });
      setShowOtpField(true);
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi du code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Veuillez entrer le code reçu.");
      return;
    }
    setOtpLoading(true);
    try {
      await AuthService.verifyPhoneOTP({ otp: otpCode });
      toast.success("Numéro de téléphone vérifié !");
      setShowOtpField(false);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, is_phone_verified: true }));
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Code invalide.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <motion.h1 
        className="profile-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Mon Profil
      </motion.h1>

      <div className="profile-grid">
        
        {/* Infos personnelles */}
        <motion.div 
          className="premium-profile-card"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        >
          <h2 className="card-header">
            <FaUser className="icon-green" /> Informations personnelles
          </h2>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label>Email (Lecture seule)</label>
              <input type="email" value={user?.email || ""} disabled className="premium-input" />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input type="text" name="first_name" value={profileData.first_name} onChange={handleProfileChange} className="premium-input" />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input type="text" name="last_name" value={profileData.last_name} onChange={handleProfileChange} className="premium-input" />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <div className="input-with-status">
                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} className="premium-input" />
                {user?.is_phone_verified ? (
                  <span className="status-badge status-verified" title="Numéro vérifié"><FaCheckCircle /> Vérifié</span>
                ) : (
                  <span className="status-badge status-unverified" title="Numéro non vérifié"><FaExclamationCircle /> Non vérifié</span>
                )}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-profile btn-green">
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </motion.div>

        {/* Section mot de passe et sécurité */}
        <div className="profile-column">
          <motion.div 
            className="premium-profile-card"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <h2 className="card-header">
              <FaLock className="icon-blue" /> Modifier le mot de passe
            </h2>
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className="premium-input" />
              </div>
              <button type="submit" disabled={loading} className="btn-profile btn-blue">
                Mettre à jour le mot de passe
              </button>
            </form>
          </motion.div>

          <motion.div 
            className="premium-profile-card"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            <h2 className="card-header">
              <FaPhone className="icon-orange" /> Vérification du téléphone
            </h2>
            {!user?.is_phone_verified ? (
              <div className="profile-form">
                <p className="phone-info-text">
                  Renforcez la sécurité de votre compte en vérifiant votre numéro de téléphone.
                </p>
                {!showOtpField ? (
                  <button onClick={handleSendOTP} disabled={otpLoading} className="btn-profile btn-orange-outline">
                    {otpLoading ? "Envoi..." : "Vérifier mon numéro"}
                  </button>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="profile-form">
                    <input type="text" placeholder="Code à 6 chiffres" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="premium-input otp-input" />
                    <button type="submit" disabled={otpLoading} className="btn-profile btn-orange">
                      Valider le code
                    </button>
                    <button type="button" onClick={() => setShowOtpField(false)} className="btn-profile btn-text">
                      Annuler
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="verified-banner">
                <FaCheckCircle />
                <p>Votre numéro de téléphone est déjà vérifié.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
