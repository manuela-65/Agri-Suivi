import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { EmployeService } from '../../api/apiClient';
import { FaUserPlus, FaUserEdit, FaUserTimes, FaCheckCircle, FaTimesCircle, FaUserCheck } from 'react-icons/fa';
import './Team.css';

export default function Team() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [activeTab, setActiveTab] = useState('employes');
  const [pointages, setPointages] = useState([]);
  const [pointageFormData, setPointageFormData] = useState({
    employe: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'PRESENT',
    heures_travaillees: 8,
    notes: ''
  });

  function getInitialFormData() {
    return {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      poste: '',
      salaire_mensuel: 0,
      date_embauche: new Date().toISOString().split('T')[0],
      statut: 'ACTIF',
      role: 'EMPLOYE',
      password: ''
    };
  }

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      const data = await EmployeService.getAllEmployes();
      setEmployes(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des employés.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointages = async () => {
    try {
      setLoading(true);
      const res = await EmployeService.getPointages();
      setPointages(res);
    } catch (error) {
      toast.error("Erreur chargement des pointages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employes') {
      fetchEmployes();
    } else {
      fetchPointages();
      if (employes.length === 0) fetchEmployes();
    }
  }, [activeTab]);

  const handleOpenModal = (employe = null) => {
    if (employe) {
      setEditingEmploye(employe);
      setFormData({
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        poste: employe.poste || '',
        salaire_mensuel: employe.salaire_mensuel || 0,
        date_embauche: employe.date_embauche || '',
        statut: employe.statut || 'ACTIF',
        role: employe.user_role || 'EMPLOYE',
        password: '' // On ne remplit pas le mot de passe
      });
    } else {
      setEditingEmploye(null);
      setFormData(getInitialFormData());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmploye(null);
    setFormData(getInitialFormData());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmploye) {
        // En édition, on ne renvoie le mot de passe que s'il a été saisi
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;
        
        await EmployeService.updateEmploye(editingEmploye.id, dataToUpdate);
        toast.success("Employé mis à jour avec succès.");
      } else {
        await EmployeService.createEmploye(formData);
        toast.success("Employé ajouté avec succès.");
      }
      fetchEmployes();
      handleCloseModal();
    } catch (error) {
      toast.error(editingEmploye ? "Erreur de mise à jour." : "Erreur d'ajout.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment désactiver/supprimer cet employé ?")) return;
    try {
      await EmployeService.deleteEmploye(id);
      toast.success("Employé supprimé.");
      fetchEmployes();
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
      console.error(error);
    }
  };

  const toggleStatut = async (emp) => {
    const nouveauStatut = emp.statut === "ACTIF" ? "INACTIF" : "ACTIF";
    try {
      await EmployeService.updateEmploye(emp.id, { ...emp, statut: nouveauStatut });
      toast.success(`Employé ${nouveauStatut.toLowerCase()} avec succès.`);
      fetchEmployes();
    } catch (error) {
      toast.error("Erreur lors de la modification du statut.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="team-loading">
        <div className="spinner"></div>
        <p>Chargement de l'équipe...</p>
      </div>
    );
  }
  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1>Mon Équipe</h1>
          <p>Gérez vos employés, comptables et leurs accès.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaUserPlus /> Ajouter un membre
        </button>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'employes' ? 'active' : ''}`} onClick={() => setActiveTab('employes')}>
          Gestion de l'Équipe
        </button>
        <button className={`tab-btn ${activeTab === 'pointages' ? 'active' : ''}`} onClick={() => setActiveTab('pointages')}>
          Présences / Pointages
        </button>
      </div>

      {activeTab === 'employes' && (
      <motion.div 
        className="team-table-container"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      >
        <table className="team-table">
          <thead>
            <tr>
              <th>Nom Complet</th>
              <th>Poste</th>
              <th>Rôle d'Accès</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  Aucun employé enregistré.
                </td>
              </tr>
            ) : (
              employes.map(emp => (
                <tr key={emp.id} className={emp.statut === 'INACTIF' ? 'inactive-row' : ''}>
                  <td>
                    <div className="emp-name">{emp.prenom} {emp.nom}</div>
                    <div className="emp-phone">{emp.telephone}</div>
                  </td>
                  <td>{emp.poste}</td>
                  <td>
                    <span className={`role-badge ${emp.user_role?.toLowerCase()}`}>
                      {emp.user_role || 'Aucun accès'}
                    </span>
                  </td>
                  <td>{emp.email || '-'}</td>
                  <td>
                    <span className={`status-badge ${emp.statut.toLowerCase()}`}>
                      {emp.statut === 'ACTIF' ? <FaCheckCircle /> : <FaTimesCircle />}
                      {emp.statut}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => handleOpenModal(emp)} title="Modifier">
                      <FaUserEdit />
                    </button>
                    <button 
                      className={`btn-icon ${emp.statut === 'ACTIF' ? 'delete' : 'activate'}`} 
                      onClick={() => toggleStatut(emp)} 
                      title={emp.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    >
                      {emp.statut === 'ACTIF' ? <FaUserTimes /> : <FaUserCheck />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
      )}

      {activeTab === 'pointages' && (
      <motion.div 
        className="team-table-container"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await EmployeService.createPointage(pointageFormData);
            toast.success("Pointage enregistré");
            fetchPointages();
          } catch(err) {
            toast.error("Erreur lors de l'enregistrement");
          }
        }} className="form-row" style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
          <div className="form-group">
            <label>Employé</label>
            <select required value={pointageFormData.employe} onChange={e => setPointageFormData({...pointageFormData, employe: e.target.value})}>
              <option value="">-- Choisir --</option>
              {employes.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" required value={pointageFormData.date} onChange={e => setPointageFormData({...pointageFormData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={pointageFormData.statut} onChange={e => setPointageFormData({...pointageFormData, statut: e.target.value})}>
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="CONGE">Congé</option>
            </select>
          </div>
          <div className="form-group">
            <label>Heures</label>
            <input type="number" step="0.5" value={pointageFormData.heures_travaillees} onChange={e => setPointageFormData({...pointageFormData, heures_travaillees: e.target.value})} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ height: '42px', width: '100%' }}>Pointer</button>
          </div>
        </form>

        <table className="team-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employé</th>
              <th>Statut</th>
              <th>Heures</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pointages.map(p => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.employe_nom}</td>
                <td><span className={`status-badge ${p.statut.toLowerCase()}`}>{p.statut}</span></td>
                <td>{p.heures_travaillees} h</td>
                <td>
                  <button className="btn-icon delete" onClick={async () => {
                    if (window.confirm("Supprimer ce pointage ?")) {
                      await EmployeService.deletePointage(p.id);
                      fetchPointages();
                    }
                  }}><FaTimesCircle /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            >
              <h2>{editingEmploye ? "Modifier l'employé" : "Ajouter un employé"}</h2>
              
              <form onSubmit={handleSubmit} className="team-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Poste (ex: Tracteur)</label>
                    <input type="text" name="poste" value={formData.poste} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date d'embauche</label>
                    <input type="date" name="date_embauche" value={formData.date_embauche} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select name="statut" value={formData.statut} onChange={handleChange}>
                      <option value="ACTIF">Actif</option>
                      <option value="INACTIF">Inactif</option>
                      <option value="CONGE">En Congé</option>
                    </select>
                  </div>
                </div>

                <hr className="divider" />
                <h3 className="section-title">Accès Système (Optionnel)</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Adresse Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Pour se connecter..." />
                  </div>
                  <div className="form-group">
                    <label>Rôle</label>
                    <select name="role" value={formData.role} onChange={handleChange} disabled={!formData.email}>
                      <option value="EMPLOYE">Employé</option>
                      <option value="COMPTABLE">Comptable / Gestionnaire</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mot de passe {editingEmploye && "(Laissez vide pour ne pas changer)"}</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    disabled={!formData.email}
                    placeholder={editingEmploye ? "Nouveau mot de passe..." : "Mot de passe par défaut: employe123"}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>Annuler</button>
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
