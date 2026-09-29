import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CultureService, EmployesService } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaSeedling, FaTractor, FaClipboardList, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import './Cultures.css';

export default function Cultures() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('parcelles');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    parcelles: [],
    cultures: [],
    activites: [],
    employes: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'parcelle', 'culture', etc.
  const [formData, setFormData] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const videoInputRef = useRef(null);
  const previewVideoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraRecorder, setCameraRecorder] = useState(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'parcelles') {
        const res = await CultureService.getParcelles();
        setData(prev => ({ ...prev, parcelles: res }));
      } else if (activeTab === 'cultures') {
        const [resCultures, resParcelles] = await Promise.all([
          CultureService.getCultures(),
          CultureService.getParcelles()
        ]);
        setData(prev => ({ ...prev, cultures: resCultures, parcelles: resParcelles }));
      } else if (activeTab === 'activites') {
        const [resActivites, resCultures, resParcelles, resEmployes] = await Promise.all([
          CultureService.getActivites(),
          CultureService.getCultures(),
          CultureService.getParcelles(),
          EmployesService.getAll()
        ]);
        setData(prev => ({ ...prev, activites: resActivites, cultures: resCultures, parcelles: resParcelles, employes: resEmployes }));
      }
    } catch (error) {
      toast.error("Erreur de chargement des données.");
    } finally {
      setLoading(false);
    }
  };

    const handleOpenModal = (type) => {
      setVideoFile(null);
    setModalType(type);
    if (type === 'activite') {
      // Si l'utilisateur connecté a une fiche employé, on le pré-sélectionne comme responsable
      const monEmploye = data.employes.find(e => e.user === user?.id);
      setFormData(monEmploye ? { employe_responsable: monEmploye.id } : {});
    } else {
      setFormData({}); // Reset form
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openVideoCamera = async () => {
    if (isRecordingVideo) {
      if (cameraRecorder && cameraRecorder.state !== 'inactive') {
        cameraRecorder.stop();
      } else if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
        setIsRecordingVideo(false);
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Votre navigateur ne prend pas en charge la caméra. Utilisez le bouton “Choisir une vidéo”.');
      return;
    }

    if (!window.MediaRecorder) {
      toast.error('L’enregistrement vidéo n’est pas supporté ici. Utilisez le bouton “Choisir une vidéo”.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: true,
      });

      setCameraStream(stream);
      setIsRecordingVideo(true);

      const video = previewVideoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();
      }

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        const file = new File([blob], 'preuve-video.webm', { type: blob.type || 'video/webm' });
        setVideoFile(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
        stream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
        setCameraRecorder(null);
        setIsRecordingVideo(false);
      };

      recorder.start();
      setCameraRecorder(recorder);
    } catch (error) {
      console.error('Accès caméra refusé :', error);
      toast.error('Accès caméra refusé. Utilisez le bouton “Choisir une vidéo”.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === 'parcelle') {
        const payload = {
          nom: formData.nom?.trim(),
          superficie: Number(formData.superficie),
          type_sol: formData.type_sol?.trim() || '',
          localisation: formData.localisation?.trim() || ''
        };

        if (!payload.nom || Number.isNaN(payload.superficie) || payload.superficie <= 0) {
          toast.error('Le nom et la superficie de la parcelle sont obligatoires.');
          return;
        }

        await CultureService.createParcelle(payload);
      } else if (modalType === 'culture') {
        const payload = {
          ...formData,
          variete: formData.variete?.trim(),
          parcelle: Number(formData.parcelle),
          date_semis: formData.date_semis,
          rendement_estime: Number(formData.rendement_estime || 0),
          statut: formData.statut || 'EN_CROISSANCE',
          notes: formData.notes || ''
        };

        if (!payload.variete || !payload.date_semis || !payload.parcelle) {
          toast.error('La variété, la parcelle et la date de semis sont obligatoires.');
          return;
        }

        await CultureService.createCulture(payload);
      } else if (modalType === 'activite') {
        if (!formData.type_activite || !formData.date_activite || !formData.description) {
          toast.error('Le type, la date et la description de l’activité sont obligatoires.');
          return;
        }

        const activityData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            activityData.append(key, value);
          }
        });

        if (videoFile) {
          activityData.append('preuve_video', videoFile);
        }

        await CultureService.createActivite(activityData);
      }

      toast.success('Enregistrement réussi.');
      setIsModalOpen(false);
      setFormData({});
      setVideoFile(null);
      setVideoPreviewUrl('');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Supprimer cet élément ?")) return;
    try {
      if (type === 'parcelle') await CultureService.deleteParcelle(id);
      if (type === 'culture') await CultureService.deleteCulture(id);
      if (type === 'activite') await CultureService.deleteActivite(id);
      toast.success("Supprimé avec succès.");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="cultures-page">
      <div className="cultures-header">
        <div>
          <h1>Mes Cultures</h1>
          <p>Gérez vos champs et vos plantations.</p>
        </div>
      </div>

      <div className="cultures-tabs">
        <button 
          className={`tab-btn ${activeTab === 'parcelles' ? 'active' : ''}`}
          onClick={() => setActiveTab('parcelles')}
        >
          <FaMapMarkerAlt /> Parcelles
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cultures' ? 'active' : ''}`}
          onClick={() => setActiveTab('cultures')}
        >
          <FaSeedling /> Cultures
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activites' ? 'active' : ''}`}
          onClick={() => setActiveTab('activites')}
        >
          <FaClipboardList /> Activités
        </button>
      </div>

      <div className="tab-content-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement en cours...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ONGLET PARCELLES */}
              {activeTab === 'parcelles' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Liste des Parcelles</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('parcelle')}>
                      <FaPlus /> Nouvelle Parcelle
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Superficie (Ha)</th>
                          <th>Type de sol</th>
                          <th>Localisation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.parcelles.length === 0 ? (
                          <tr><td colSpan="5" className="text-center">Aucune parcelle.</td></tr>
                        ) : data.parcelles.map(p => (
                          <tr key={p.id}>
                            <td className="font-semibold">{p.nom}</td>
                            <td>{p.superficie}</td>
                            <td>{p.type_sol || '-'}</td>
                            <td>{p.localisation || '-'}</td>
                            <td className="actions-cell">
                              <button className="btn-icon delete" onClick={() => handleDelete(p.id, 'parcelle')}><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ONGLET CULTURES */}
              {activeTab === 'cultures' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Plantations & Cultures en cours</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('culture')}>
                      <FaPlus /> Nouvelle Culture
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Variété</th>
                          <th>Parcelle</th>
                          <th>Date Semis</th>
                          <th>Rendement Est.</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.cultures.length === 0 ? (
                          <tr><td colSpan="6" className="text-center">Aucune culture.</td></tr>
                        ) : data.cultures.map(c => (
                          <tr key={c.id}>
                            <td className="font-semibold">{c.variete}</td>
                            <td>{c.parcelle_nom || `Parcelle #${c.parcelle}`}</td>
                            <td>{c.date_semis}</td>
                            <td>{c.rendement_estime} Tonnes</td>
                            <td><span className={`status-badge ${c.statut.toLowerCase()}`}>{c.statut}</span></td>
                            <td className="actions-cell">
                              <button className="btn-icon delete" onClick={() => handleDelete(c.id, 'culture')}><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ONGLET ACTIVITES */}
              {activeTab === 'activites' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Rapport d'Activités (Journal de bord)</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('activite')}>
                      <FaPlus /> Déclarer une activité
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type d'activité</th>
                          <th>Description</th>
                          <th>Responsable</th>
                          <th>Coût Associé</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.activites.length === 0 ? (
                          <tr><td colSpan="6" className="text-center">Aucune activité enregistrée.</td></tr>
                        ) : data.activites.map(a => (
                          <tr key={a.id}>
                            <td className="font-semibold">{a.date_activite}</td>
                            <td>{a.type_activite}</td>
                            <td>{a.description}</td>
                            <td>{a.employe_nom || '-'}</td>
                            <td className="cost-cell">{a.cout_associe} FCFA</td>
                            <td className="actions-cell">
                              <button className="btn-icon delete" onClick={() => handleDelete(a.id, 'activite')}><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* MODAL GÉNÉRIQUE POUR L'AJOUT */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <div className="modal-header">
                <h2>
                  {modalType === 'parcelle' && 'Ajouter une Parcelle'}
                  {modalType === 'culture' && 'Nouvelle Culture'}
                  {modalType === 'activite' && 'Déclarer une Activité'}
                </h2>
                <button type="button" className="close-modal-btn" onClick={() => setIsModalOpen(false)} title="Fermer">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="generic-form">
                
                {modalType === 'parcelle' && (
                  <>
                    <div className="form-group">
                      <label>Nom de la parcelle</label>
                      <input type="text" name="nom" required onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Superficie (Ha)</label>
                        <input type="number" step="0.01" name="superficie" required onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Type de sol</label>
                        <input type="text" name="type_sol" onChange={handleChange} />
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'culture' && (
                  <>
                    <div className="form-group">
                      <label>Variété (Ex: Maïs, Cacao)</label>
                      <input type="text" name="variete" required onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Parcelle</label>
                        <select name="parcelle" required onChange={handleChange} value={formData.parcelle || ''}>
                          <option value="">-- Choisir une parcelle --</option>
                          {data.parcelles.map(p => (
                            <option key={p.id} value={p.id}>{p.nom} ({p.superficie} Ha)</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Date de Semis</label>
                        <input type="date" name="date_semis" required onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Statut</label>
                      <select name="statut" onChange={handleChange} required>
                        <option value="">-- Choisir --</option>
                        <option value="EN_CROISSANCE">En Croissance</option>
                        <option value="RECOLTE_EN_COURS">Récolte en Cours</option>
                        <option value="TERMINEE">Terminée</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'activite' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Culture liée (Optionnel)</label>
                        <select name="culture" onChange={handleChange} value={formData.culture || ''}>
                          <option value="">-- Aucune culture spécifique --</option>
                          {data.cultures.map(c => (
                            <option key={c.id} value={c.id}>{c.variete} ({c.parcelle_nom || `Parcelle #${c.parcelle}`})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Type (Semis, Engrais...)</label>
                        <input type="text" name="type_activite" required onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date de l'activité</label>
                        <input type="date" name="date_activite" required onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Responsable</label>
                        <select name="employe_responsable" onChange={handleChange} value={formData.employe_responsable || ''}>
                          <option value="">-- Non assigné --</option>
                          {data.employes.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name || `${emp.prenom} ${emp.nom}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Coût Associé (FCFA)</label>
                        <input type="number" name="cout_associe" onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea name="description" required onChange={handleChange}></textarea>
                    </div>

                    <div className="form-group">
  <label>Preuve vidéo de l'activité</label>

  <button type="button" onClick={openVideoCamera}>
    {isRecordingVideo ? '🛑 Arrêter l\'enregistrement' : '🎥 Ouvrir la caméra'}
  </button>

  <button type="button" onClick={() => videoInputRef.current?.click()}>
    📁 Choisir une vidéo
  </button>

  <input
    ref={videoInputRef}
    type="file"
    accept="video/*"
    hidden
    required
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setVideoFile(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
      }
    }}
  />

  {videoPreviewUrl ? (
    <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '220px', borderRadius: '10px' }} />
  ) : (
    <video ref={previewVideoRef} autoPlay muted playsInline style={{ width: '100%', maxHeight: '220px', borderRadius: '10px', display: isRecordingVideo ? 'block' : 'none' }} />
  )}

  <small>
    La caméra s'ouvre directement pour filmer la preuve.
  </small>
</div>
                  </>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn-save">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}