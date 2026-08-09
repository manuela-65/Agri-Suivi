import React, { useState, useEffect, useRef } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPalette,
  FaImage,
  FaMoneyBillWave,
  FaRulerCombined,
  FaAlignLeft,
  FaSave,
  FaUpload,
  FaCheck
} from "react-icons/fa";
import { motion } from "framer-motion";
import { ParametresService } from "../api/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "../Styles/Parametres.css";

function Parametres() {
  const { refreshSettings } = useAuth();
  const [form, setForm] = useState({
    nom: "",
    couleur_primaire: "#2e7d32",
    couleur_secondaire: "#81c784",
    adresse: "",
    ville: "",
    description: "",
    devise: "FCFA",
    superficie_totale: 0
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadParametres() {
      try {
        const data = await ParametresService.getParams();
        setForm({
          nom: data.nom || "",
          couleur_primaire: data.couleur_primaire || "#2e7d32",
          couleur_secondaire: data.couleur_secondaire || "#81c784",
          adresse: data.adresse || "",
          ville: data.ville || "",
          description: data.description || "",
          devise: data.devise || "FCFA",
          superficie_totale: data.superficie_totale || 0
        });
        if (data.logo) {
          setLogoPreview(data.logo);
        }
      } catch (err) {
        console.log("Lecture des paramètres locaux démo.");
        const local = JSON.parse(localStorage.getItem("parametresExploitation"));
        if (local) setForm(local);
      } finally {
        setLoading(false);
      }
    }
    loadParametres();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const enregistrerParametres = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("nom", form.nom);
      formData.append("adresse", form.adresse);
      formData.append("ville", form.ville);
      formData.append("description", form.description);
      formData.append("devise", form.devise);
      formData.append("superficie_totale", form.superficie_totale || 0);
      formData.append("couleur_primaire", form.couleur_primaire);
      formData.append("couleur_secondaire", form.couleur_secondaire);
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await ParametresService.updateParams(formData);
      await refreshSettings();
      toast.success("Paramètres mis à jour avec succès !");
    } catch (err) {
      localStorage.setItem("parametresExploitation", JSON.stringify(form));
      toast.success("Paramètres enregistrés localement !");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="premium-parametres">
      {/* HERO */}
      <motion.div 
          className="page-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
      >
        <div className="page-hero-content">
          <h1>Paramètres de l'exploitation</h1>
          <p>Personnalisez l'identité, les informations et l'apparence de votre espace de travail.</p>
        </div>
      </motion.div>

      <form className="parametres-form" onSubmit={enregistrerParametres}>
        <div className="settings-grid">
          
          {/* GENERAL INFO */}
          <motion.div 
            className="premium-card settings-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="settings-header">
              <FaBuilding className="settings-icon" />
              <h2>Informations Générales</h2>
            </div>
            
            <div className="premium-form-grid">
              <div className="form-group full-width">
                <label>Nom de l'exploitation</label>
                <input
                  className="premium-input"
                  name="nom"
                  placeholder="Ex: Ferme du Soleil"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Adresse physique</label>
                <input
                  className="premium-input"
                  name="adresse"
                  placeholder="Ex: Route Nationale 3"
                  value={form.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Ville</label>
                <input
                  className="premium-input"
                  name="ville"
                  placeholder="Ex: Yaoundé"
                  value={form.ville}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  className="premium-input"
                  name="description"
                  placeholder="Brève description de votre activité..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
          </motion.div>

          {/* LOGO AND BRANDING */}
          <div className="settings-column">
            <motion.div 
              className="premium-card settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="settings-header">
                <FaImage className="settings-icon" />
                <h2>Logo de l'Exploitation</h2>
              </div>
              
              <div className="logo-upload-area">
                <div className="logo-preview">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo de l'exploitation" />
                  ) : (
                    <div className="logo-placeholder">
                      <FaImage />
                      <span>Aucun logo</span>
                    </div>
                  )}
                </div>
                <div className="upload-controls">
                  <p className="upload-hint">PNG, JPG, carré (Ex: 500x500px). Max 2Mo.</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleLogoChange} 
                    className="hidden-file-input"
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaUpload /> Importer un logo
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="premium-card settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="settings-header">
                <FaPalette className="settings-icon" />
                <h2>Thème & Couleurs</h2>
              </div>
              
              <div className="premium-form-grid">
                <div className="form-group">
                  <label>Couleur principale</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      name="couleur_primaire"
                      value={form.couleur_primaire}
                      onChange={handleChange}
                      className="color-input"
                    />
                    <span className="color-hex">{form.couleur_primaire.toUpperCase()}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Couleur d'accentuation</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      name="couleur_secondaire"
                      value={form.couleur_secondaire}
                      onChange={handleChange}
                      className="color-input"
                    />
                    <span className="color-hex">{form.couleur_secondaire.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="premium-card settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="settings-header">
                <FaRulerCombined className="settings-icon" />
                <h2>Données Techniques</h2>
              </div>
              
              <div className="premium-form-grid">
                <div className="form-group">
                  <label>Devise Principale</label>
                  <input
                    className="premium-input"
                    name="devise"
                    placeholder="Ex: FCFA, EUR, USD"
                    value={form.devise}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Superficie totale (Hectares)</label>
                  <input
                    className="premium-input"
                    type="number"
                    step="0.01"
                    min="0"
                    name="superficie_totale"
                    value={form.superficie_totale}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FLOATING SAVE BAR */}
        <motion.div 
          className="save-bar premium-card"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="save-bar-content">
            <p>N'oubliez pas de sauvegarder vos modifications.</p>
            <button type="submit" className="btn btn-primary btn-large" disabled={isSaving}>
              {isSaving ? "Sauvegarde..." : <><FaCheck /> Enregistrer les paramètres</>}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}

export default Parametres;