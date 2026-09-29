import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ParametresService } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaMapMarkerAlt, FaPalette, FaImage, FaCamera, FaSave } from 'react-icons/fa';
import './Settings.css';

export default function Settings() {
  const { refreshSettings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [params, setParams] = useState({
    nom: '',
    adresse: '',
    ville: '',
    devise: 'FCFA',
    type_exploitation: 'CULTURES',
    couleur_primaire: '#2e7d32',
    couleur_secondaire: '#81c784',
    superficie_totale: 0,
    description: '',
    logo: null
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      setLoading(true);
      const data = await ParametresService.getParams();
      setParams(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des paramètres.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = params;
      if (logoFile) {
        payload = new FormData();
        Object.keys(params).forEach(key => {
          if (params[key] !== null && key !== 'logo') {
            payload.append(key, params[key]);
          }
        });
        payload.append('logo', logoFile);
      }
      const data = await ParametresService.updateParams(payload);
      setParams(data);
      setLogoFile(null);
      if (data?.couleur_primaire) {
        document.documentElement.style.setProperty('--primary', data.couleur_primaire);
      }
      if (refreshSettings) await refreshSettings();
      toast.success("Paramètres et identité visuelle enregistrés avec succès !");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour des paramètres.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header-compact">
        <div className="page-header-compact-title">
          <h1>Paramètres de l'Exploitation</h1>
          <p>Configurez les informations globales, identité visuelle et devise de votre ferme</p>
        </div>
        <div className="page-header-compact-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-content">
        <div className="settings-grid">
          
          {/* COLONNE GAUCHE: IDENTITÉ & LOGO */}
          <div className="settings-col">
            {/* LOGO */}
            <div className="settings-card">
              <h2 className="section-title"><FaImage /> Logo de l'Exploitation</h2>
              <div className="logo-upload-container">
                <div className="logo-preview">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Nouveau logo" />
                  ) : params.logo ? (
                    <img src={params.logo} alt="Logo actuel" />
                  ) : (
                    <div className="logo-placeholder"><FaCamera /></div>
                  )}
                </div>
                <div className="logo-upload-actions">
                  <p>Format recommandé : PNG ou JPG avec fond transparent.</p>
                  <label className="btn-upload">
                    Choisir un logo
                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{display: 'none'}} />
                  </label>
                </div>
              </div>
            </div>

            {/* INFORMATIONS GÉNÉRALES */}
            <div className="settings-card">
              <h2 className="section-title"><FaBuilding /> Informations Générales</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'exploitation</label>
                  <input 
                    type="text" 
                    name="nom" 
                    value={params.nom} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ex: Ferme du Soleil"
                  />
                </div>
                <div className="form-group">
                  <label>Devise principale</label>
                  <select name="devise" value={params.devise} onChange={handleChange}>
                    <option value="FCFA">FCFA (Franc CFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Type d'exploitation</label>
                <select name="type_exploitation" value={params.type_exploitation} onChange={handleChange}>
                  <option value="CULTURES">Cultures / Végétal</option>
                  <option value="ELEVAGE">Élevage / Animal</option>
                  <option value="MIXTE">Cultures et Élevage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description courte</label>
                <textarea 
                  name="description" 
                  value={params.description || ''} 
                  onChange={handleChange} 
                  rows="3"
                  placeholder="Description succincte de vos activités..."
                />
              </div>
            </div>
          </div>

          {/* COLONNE DROITE: LOCALISATION & COULEURS */}
          <div className="settings-col">
            {/* LOCALISATION */}
            <div className="settings-card">
              <h2 className="section-title"><FaMapMarkerAlt /> Localisation & Superficie</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Adresse</label>
                  <input 
                    type="text" 
                    name="adresse" 
                    value={params.adresse || ''} 
                    onChange={handleChange} 
                    placeholder="Lieu-dit, Route..."
                  />
                </div>
                <div className="form-group">
                  <label>Ville / Région</label>
                  <input 
                    type="text" 
                    name="ville" 
                    value={params.ville || ''} 
                    onChange={handleChange} 
                    placeholder="Ex: Yaoundé"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Superficie totale (Hectares)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="superficie_totale" 
                  value={params.superficie_totale} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* PERSONNALISATION VISUELLE */}
            <div className="settings-card">
              <h2 className="section-title"><FaPalette /> Personnalisation Graphique</h2>
              <p className="section-desc">Ces teintes s'appliquent à vos rapports, exports et documents officiels.</p>
              
              <div className="form-row colors-row">
                <div className="form-group color-group">
                  <label>Couleur Principale</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      name="couleur_primaire" 
                      value={params.couleur_primaire || '#2e7d32'} 
                      onChange={handleChange} 
                    />
                    <span className="color-code">{params.couleur_primaire}</span>
                  </div>
                </div>
                
                <div className="form-group color-group">
                  <label>Couleur Secondaire</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      name="couleur_secondaire" 
                      value={params.couleur_secondaire || '#81c784'} 
                      onChange={handleChange} 
                    />
                    <span className="color-code">{params.couleur_secondaire}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
