import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { EmployeService } from '../../api/apiClient';
import { 
  FaUserPlus, 
  FaUserEdit, 
  FaUserTimes, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserCheck,
  FaSearch,
  FaTimes,
  FaBolt,
  FaSave,
  FaCheck,
  FaCalendarTimes
} from 'react-icons/fa';
import './Team.css';

export default function Team() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [activeTab, setActiveTab] = useState('employes');
  const [pointages, setPointages] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pointageFilter, setPointageFilter] = useState('ALL'); // ALL, RECORDED, PENDING
  const [rosterState, setRosterState] = useState({});
  const [isSavingAll, setIsSavingAll] = useState(false);

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
      const list = Array.isArray(data) ? data : (data?.results || []);
      setEmployes(list);
    } catch (error) {
      console.warn("Info chargement employés:", error);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointages = async () => {
    try {
      const res = await EmployeService.getPointages();
      const list = Array.isArray(res) ? res : (res?.results || []);
      setPointages(list);
    } catch (error) {
      console.warn("Info chargement pointages:", error);
      setPointages([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'pointages') {
      fetchPointages();
      if (employes.length === 0) fetchEmployes();
    }
  }, [activeTab]);

  // Synchroniser la feuille de présence (roster) quand la date ou les données changent
  useEffect(() => {
    if (!Array.isArray(employes) || employes.length === 0) return;

    const newRoster = {};
    employes.forEach(emp => {
      // Trouver un pointage existant pour cet employé et cette date
      const existing = (pointages || []).find(
        p => (p.employe === emp.id || p.employe_id === emp.id) && p.date === selectedDate
      );

      if (existing) {
        newRoster[emp.id] = {
          statut: existing.statut || 'PRESENT',
          heures: parseFloat(existing.heures_travaillees ?? 8),
          notes: existing.notes || '',
          existingId: existing.id,
          isModified: false,
          saved: true,
          isSaving: false
        };
      } else {
        // Pré-remplissage par défaut
        newRoster[emp.id] = {
          statut: emp.statut === 'CONGE' ? 'CONGE' : 'PRESENT',
          heures: emp.statut === 'CONGE' ? 0 : 8,
          notes: '',
          existingId: null,
          isModified: false,
          saved: false,
          isSaving: false
        };
      }
    });

    setRosterState(newRoster);
  }, [employes, pointages, selectedDate]);

  // Handlers pour la feuille de pointages
  const handleUpdateRosterRow = (empId, statut, heures) => {
    setRosterState(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        statut,
        heures,
        isModified: true
      }
    }));
  };

  const handleRosterFieldChange = (empId, field, value) => {
    setRosterState(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [field]: value,
        isModified: true
      }
    }));
  };

  const handleMarkAllPresent = () => {
    setRosterState(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(empId => {
        updated[empId] = {
          ...updated[empId],
          statut: 'PRESENT',
          heures: 8,
          isModified: true
        };
      });
      return updated;
    });
    toast.success("Tous les employés marqués Présents (8h). N'oubliez pas d'enregistrer !");
  };

  const handleSaveSingleRow = async (empId) => {
    const row = rosterState[empId];
    if (!row) return;

    setRosterState(prev => ({
      ...prev,
      [empId]: { ...prev[empId], isSaving: true }
    }));

    const payload = {
      employe: empId,
      date: selectedDate,
      statut: row.statut,
      heures_travaillees: row.heures,
      notes: row.notes || ''
    };

    try {
      if (row.existingId && EmployeService.updatePointage) {
        await EmployeService.updatePointage(row.existingId, payload);
      } else {
        const created = await EmployeService.createPointage(payload);
        row.existingId = created?.id;
      }
      toast.success("Pointage validé !");
      setRosterState(prev => ({
        ...prev,
        [empId]: {
          ...prev[empId],
          existingId: row.existingId,
          isModified: false,
          saved: true,
          isSaving: false
        }
      }));
      fetchPointages();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement du pointage.");
      setRosterState(prev => ({
        ...prev,
        [empId]: { ...prev[empId], isSaving: false }
      }));
    }
  };

  const handleSaveAllPointages = async () => {
    setIsSavingAll(true);
    let successCount = 0;
    try {
      const entries = Object.entries(rosterState);
      const promises = entries.map(async ([empId, row]) => {
        const payload = {
          employe: parseInt(empId, 10),
          date: selectedDate,
          statut: row.statut,
          heures_travaillees: row.heures,
          notes: row.notes || ''
        };

        if (row.existingId && EmployeService.updatePointage) {
          return EmployeService.updatePointage(row.existingId, payload);
        } else {
          return EmployeService.createPointage(payload);
        }
      });

      const results = await Promise.allSettled(promises);
      results.forEach(res => {
        if (res.status === 'fulfilled') successCount++;
      });

      toast.success(`${successCount} pointage(s) enregistré(s) avec succès !`);
      fetchPointages();
    } catch (err) {
      toast.error("Une erreur est survenue pendant l'enregistrement global.");
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleDeletePointageRow = async (empId, pointageId) => {
    if (!window.confirm("Supprimer ce pointage ?")) return;
    try {
      await EmployeService.deletePointage(pointageId);
      toast.success("Pointage retiré.");
      setRosterState(prev => ({
        ...prev,
        [empId]: {
          ...prev[empId],
          existingId: null,
          saved: false,
          isModified: false,
          statut: 'PRESENT',
          heures: 8,
          notes: ''
        }
      }));
      fetchPointages();
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // Calculs statistiques pour la feuille de pointages
  const activeEmployesList = employes.filter(e => e.statut !== 'INACTIF');
  const recordedCount = activeEmployesList.filter(e => rosterState[e.id]?.existingId).length;

  const filteredRosterEmployes = activeEmployesList.filter(emp => {
    const row = rosterState[emp.id];
    if (pointageFilter === 'RECORDED') return !!row?.existingId;
    if (pointageFilter === 'PENDING') return !row?.existingId;
    return true;
  });

  const presentCount = Object.values(rosterState).filter(r => r.statut === 'PRESENT').length;
  const absentCount = Object.values(rosterState).filter(r => r.statut === 'ABSENT').length;
  const congeCount = Object.values(rosterState).filter(r => r.statut === 'CONGE').length;
  const totalHoursDay = Object.values(rosterState).reduce((acc, r) => acc + (parseFloat(r.heures) || 0), 0);

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
  const filteredEmployes = employes.filter(emp => {
    const fullName = `${emp.prenom || ''} ${emp.nom || ''}`.toLowerCase();
    const poste = (emp.poste || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const phone = (emp.telephone || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || fullName.includes(q) || poste.includes(q) || email.includes(q) || phone.includes(q);
    const matchesStatus = statusFilter === "ALL" || emp.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          Gestion de l'Équipe ({employes.length})
        </button>
        <button className={`tab-btn ${activeTab === 'pointages' ? 'active' : ''}`} onClick={() => setActiveTab('pointages')}>
          Présences / Pointages
        </button>
      </div>

      {activeTab === 'employes' && (
      <>
        {/* TEAM TOOLBAR */}
        <div className="toolbar-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Rechercher par nom, poste, tél..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm("")} title="Effacer">
                <FaTimes />
              </button>
            )}
          </div>

          <div className="type-filters">
            <button 
              className={`type-filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tous <span className="filter-count">{employes.length}</span>
            </button>
            <button 
              className={`type-filter-btn ${statusFilter === 'ACTIF' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIF')}
            >
              Actifs <span className="filter-count">{employes.filter(e => e.statut === 'ACTIF').length}</span>
            </button>
            <button 
              className={`type-filter-btn ${statusFilter === 'INACTIF' ? 'active' : ''}`}
              onClick={() => setStatusFilter('INACTIF')}
            >
              Inactifs <span className="filter-count">{employes.filter(e => e.statut === 'INACTIF').length}</span>
            </button>
          </div>
        </div>

        <motion.div 
          className="team-table-container"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        >
          <table className="team-table">
            <thead>
              <tr>
                <th className="col-nom">Nom Complet</th>
                <th className="col-poste">Poste</th>
                <th className="col-role">Rôle d'Accès</th>
                <th className="col-email">Email</th>
                <th className="col-statut">Statut</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {searchTerm ? "Aucun employé ne correspond à votre recherche." : "Aucun employé enregistré."}
                  </td>
                </tr>
              ) : (
                filteredEmployes.map(emp => (
                  <tr key={emp.id} className={emp.statut === 'INACTIF' ? 'inactive-row' : ''}>
                    <td className="col-nom">
                      <div className="emp-name">{emp.prenom} {emp.nom}</div>
                      <div className="emp-phone">{emp.telephone}</div>
                    </td>
                    <td className="col-poste">{emp.poste}</td>
                    <td className="col-role">
                      <span className={`role-badge ${emp.user_role?.toLowerCase()}`}>
                        {emp.user_role || 'Aucun accès'}
                      </span>
                    </td>
                    <td className="col-email">{emp.email || '-'}</td>
                    <td className="col-statut">
                      <span className={`status-badge ${emp.statut?.toLowerCase()}`}>
                        {emp.statut === 'ACTIF' ? <FaCheckCircle /> : <FaTimesCircle />}
                        {emp.statut}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="actions-cell">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </>
      )}

      {activeTab === 'pointages' && (
        <motion.div 
          className="pointages-roster-view"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        >
          {/* Top Control Bar for Pointages */}
          <div className="pointages-toolbar">
            <div className="pointages-date-picker">
              <label htmlFor="pointage-date">Date :</label>
              <input 
                id="pointage-date"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input-modern"
              />
            </div>

            <div className="pointages-quick-filters">
              <button 
                type="button" 
                className={`pointages-filter-btn ${pointageFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setPointageFilter('ALL')}
              >
                Tous <span className="filter-count-badge">{activeEmployesList.length}</span>
              </button>
              <button 
                type="button" 
                className={`pointages-filter-btn ${pointageFilter === 'RECORDED' ? 'active' : ''}`}
                onClick={() => setPointageFilter('RECORDED')}
              >
                Pointés <span className="filter-count-badge">{recordedCount}</span>
              </button>
              <button 
                type="button" 
                className={`pointages-filter-btn ${pointageFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setPointageFilter('PENDING')}
              >
                À pointer <span className="filter-count-badge">{activeEmployesList.length - recordedCount}</span>
              </button>
            </div>

            <div className="pointages-bulk-actions">
              <button 
                type="button" 
                className="btn-quick-bulk"
                onClick={handleMarkAllPresent}
                title="Définir 8h et statut Présent pour tous les employés"
              >
                <FaBolt /> Tous Présents (8h)
              </button>
              <button 
                type="button" 
                className="btn-primary btn-save-bulk"
                onClick={handleSaveAllPointages}
                disabled={isSavingAll}
              >
                <FaSave /> {isSavingAll ? "Enregistrement..." : "Tout Enregistrer"}
              </button>
            </div>
          </div>

          {/* Roster Attendance Table */}
          <div className="team-table-container">
            <table className="team-table pointages-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Employé</th>
                  <th style={{ width: '130px' }}>Poste</th>
                  <th style={{ minWidth: '260px' }}>Présence / Statut</th>
                  <th style={{ width: '100px' }}>Heures</th>
                  <th style={{ minWidth: '180px' }}>Note / Commentaire</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRosterEmployes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      Aucun employé ne correspond aux filtres pour cette journée.
                    </td>
                  </tr>
                ) : (
                  filteredRosterEmployes.map(emp => {
                    const row = rosterState[emp.id] || { statut: 'PRESENT', heures: 8, notes: '', saved: false };
                    const isRecorded = !!row.existingId;

                    return (
                      <tr key={emp.id} className={row.saved ? 'row-saved' : ''}>
                        <td>
                          <div className="emp-identity-cell">
                            <div className="emp-avatar-circle">
                              {(emp.prenom?.[0] || 'E')}{(emp.nom?.[0] || '')}
                            </div>
                            <div>
                              <div className="emp-name">{emp.prenom} {emp.nom}</div>
                              <div className="emp-phone">{emp.telephone || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="emp-poste-tag">{emp.poste || 'Général'}</span>
                        </td>
                        <td>
                          <div className="attendance-pills-group">
                            <button
                              type="button"
                              className={`attendance-pill present ${row.statut === 'PRESENT' ? 'active' : ''}`}
                              onClick={() => handleUpdateRosterRow(emp.id, 'PRESENT', 8)}
                            >
                              <FaCheck style={{ fontSize: 10 }} /> Présent
                            </button>
                            <button
                              type="button"
                              className={`attendance-pill absent ${row.statut === 'ABSENT' ? 'active' : ''}`}
                              onClick={() => handleUpdateRosterRow(emp.id, 'ABSENT', 0)}
                            >
                              <FaTimes style={{ fontSize: 10 }} /> Absent
                            </button>
                            <button
                              type="button"
                              className={`attendance-pill conge ${row.statut === 'CONGE' ? 'active' : ''}`}
                              onClick={() => handleUpdateRosterRow(emp.id, 'CONGE', 0)}
                            >
                              <FaCalendarTimes style={{ fontSize: 10 }} /> Congé
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="hours-input-wrapper">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={row.heures}
                              disabled={row.statut === 'ABSENT' || row.statut === 'CONGE'}
                              onChange={(e) => handleRosterFieldChange(emp.id, 'heures', parseFloat(e.target.value) || 0)}
                              className="hours-input"
                            />
                            <span className="hours-suffix">h</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Obs. (ex: parcelle sud, retard...)"
                            value={row.notes}
                            onChange={(e) => handleRosterFieldChange(emp.id, 'notes', e.target.value)}
                            className="notes-input"
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className={`btn-row-action ${row.isModified ? 'needs-save' : isRecorded ? 'is-saved' : 'can-save'}`}
                              onClick={() => handleSaveSingleRow(emp.id)}
                              title={isRecorded ? "Mettre à jour ce pointage" : "Enregistrer"}
                            >
                              {row.isSaving ? "..." : row.isModified ? "Enregistrer" : isRecorded ? "✓ À jour" : "Valider"}
                            </button>
                            {isRecorded && (
                              <button
                                type="button"
                                className="btn-icon delete"
                                onClick={() => handleDeletePointageRow(emp.id, row.existingId)}
                                title="Supprimer le pointage"
                              >
                                <FaTimesCircle />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Daily Summary Bar */}
          <div className="pointages-summary-bar">
            <div className="summary-item">
              <span className="summary-label">Date :</span>
              <span className="summary-val">{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="summary-metrics">
              <div className="metric-badge present">
                <span>Présents :</span> <strong>{presentCount}</strong>
              </div>
              <div className="metric-badge absent">
                <span>Absents :</span> <strong>{absentCount}</strong>
              </div>
              <div className="metric-badge conge">
                <span>Congés :</span> <strong>{congeCount}</strong>
              </div>
              <div className="metric-badge hours">
                <span>Total Heures :</span> <strong>{totalHoursDay} h</strong>
              </div>
            </div>
          </div>
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
              <div className="modal-header">
                <h2>{editingEmploye ? "Modifier l'employé" : "Ajouter un employé"}</h2>
                <button type="button" className="close-modal-btn" onClick={handleCloseModal} title="Fermer">
                  <FaTimes />
                </button>
              </div>
              
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
