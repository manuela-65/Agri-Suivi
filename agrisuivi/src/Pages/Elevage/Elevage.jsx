import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CultureService, EmployesService } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { FaTractor, FaClipboardList, FaPlus, FaTrash } from 'react-icons/fa';
import './Elevage.css';

export default function Elevage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('elevage');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    elevages: [],
    activites: [],
    employes: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'elevage' or 'activite'
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
      if (activeTab === 'elevage') {
        const res = await CultureService.getElevages();
        setData(prev => ({ ...prev, elevages: res }));
      } else if (activeTab === 'activites') {
        const [resActivites, resElevages, resEmployes] = await Promise.all([
          CultureService.getActivites(),
          CultureService.getElevages(),
          EmployesService.getAll()
        ]);
        setData(prev => ({ ...prev, activites: resActivites, elevages: resElevages, employes: resEmployes }));
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
      setFormData({});
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
      if (modalType === 'elevage') {
        const payload = {
          ...formData,
          type_animaux: formData.type_animaux?.trim(),
          nombre_tetes: Number(formData.nombre_tetes),
          date_acquisition: formData.date_acquisition,
          statut_sanitaire: formData.statut_sanitaire || 'Bon',
          batiment: formData.batiment || '',
        };

        if (!payload.type_animaux || !payload.date_acquisition || Number.isNaN(payload.nombre_tetes) || payload.nombre_tetes <= 0) {
          toast.error('Le type, la date d’acquisition et le nombre de têtes sont obligatoires.');
          return;
        }

        await CultureService.createElevage(payload);
      } else if (modalType === 'activite') {
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            payload.append(key, value);
          }
        });

        if (!formData.type_activite || !formData.date_activite || !formData.description) {
          toast.error('Le type, la date et la description de l’activité sont obligatoires.');
          return;
        }

        if (videoFile) {
          payload.append('preuve_video', videoFile);
        }

        await CultureService.createActivite(payload);
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
      if (type === 'elevage') await CultureService.deleteElevage(id);
      if (type === 'activite') await CultureService.deleteActivite(id);
      toast.success("Supprimé avec succès.");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="elevage-page">
      <div className="elevage-header">
        <div>
          <h1>Mon Élevage</h1>
          <p>Gérez vos troupeaux et le suivi de santé animale.</p>
        </div>
      </div>

      <div className="elevage-tabs">
        <button 
          className={`tab-btn ${activeTab === 'elevage' ? 'active' : ''}`}
          onClick={() => setActiveTab('elevage')}
        >
          <FaTractor /> Élevage / Cheptel
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activites' ? 'active' : ''}`}
          onClick={() => setActiveTab('activites')}
        >
          <FaClipboardList /> Activités & Soins
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
              {activeTab === 'elevage' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Cheptels et Élevage</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('elevage')}>
                      <FaPlus /> Nouveau Troupeau
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type d'animaux</th>
                          <th>Nombre</th>
                          <th>Bâtiment / Enclos</th>
                          <th>État Sanitaire</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.elevages.length === 0 ? (
                          <tr><td colSpan="5" className="text-center">Aucun élevage enregistré.</td></tr>
                        ) : data.elevages.map(e => (
                          <tr key={e.id}>
                            <td className="font-semibold">{e.type_animaux}</td>
                            <td>{e.nombre_tetes} têtes</td>
                            <td>{e.batiment || '-'}</td>
                            <td>{e.statut_sanitaire}</td>
                            <td className="actions-cell">
                              <button className="btn-icon delete" onClick={() => handleDelete(e.id, 'elevage')}><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'activites' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Rapport de Soins et Activités</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('activite')}>
                      <FaPlus /> Déclarer un soin / activité
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type de soin</th>
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

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <h2>
                {modalType === 'elevage' && 'Nouveau Troupeau'}
                {modalType === 'activite' && 'Déclarer un soin / activité'}
              </h2>
              
              <form onSubmit={handleSubmit} className="generic-form">
                
                {modalType === 'elevage' && (
                  <>
                    <div className="form-group">
                      <label>Type d'animaux (ex: Poulets, Bovins)</label>
                      <input type="text" name="type_animaux" required onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre de têtes</label>
                        <input type="number" name="nombre_tetes" required onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Date d'acquisition</label>
                        <input type="date" name="date_acquisition" required onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Bâtiment / Enclos</label>
                        <input type="text" name="batiment" onChange={handleChange} placeholder="ex: Enclos B" />
                      </div>
                      <div className="form-group">
                        <label>État sanitaire</label>
                        <select name="statut_sanitaire" onChange={handleChange} defaultValue="Bon">
                          <option value="Bon">Bon</option>
                          <option value="À surveiller">À surveiller</option>
                          <option value="Traitement en cours">Traitement en cours</option>
                          <option value="Risque">Risque</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'activite' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Troupeau concerné</label>
                        <select name="elevage" onChange={handleChange} value={formData.elevage || ''}>
                          <option value="">-- Aucun troupeau spécifique --</option>
                          {data.elevages.map(el => (
                            <option key={el.id} value={el.id}>{el.type_animaux} ({el.nombre_tetes} têtes)</option>
                          ))}
                        </select>
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
                        <label>Type (Vaccination, Alimentation...)</label>
                        <input type="text" name="type_activite" required onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="date_activite" required onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea name="description" required onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                      <label>Coût Associé (FCFA)</label>
                      <input type="number" name="cout_associe" min="0" defaultValue="0" onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>Preuve vidéo</label>

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
                        La caméra s'ouvre directement pour enregistrer la preuve vidéo.
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