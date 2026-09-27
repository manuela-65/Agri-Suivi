import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { StockService } from '../../api/apiClient';
import { FaBoxOpen, FaPlus, FaMinus, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import './Stocks.css';

export default function Stocks() {
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'article', 'mouvement'
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('inventaire'); // 'inventaire', 'historique'

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventaire') {
        const res = await StockService.getArticles();
        setArticles(res);
      } else {
        const res = await StockService.getMouvements();
        setMouvements(res);
      }
    } catch (error) {
      toast.error("Erreur de chargement des stocks.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, articleId = null, typeMvt = 'ENTREE') => {
    setModalMode(mode);
    if (mode === 'mouvement') {
      setFormData({
        article: articleId || '',
        type_mouvement: typeMvt,
        quantite: '',
        prix_total: 0,
        motif: ''
      });
    } else {
      setFormData({
        nom: '',
        type_article: 'INTRANT',
        quantite_en_stock: 0,
        seuil_alerte: 10,
        unite_mesure: 'kg',
        prix_unitaire_moyen: 0,
        emplacement: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'article') {
        await StockService.createArticle(formData);
        toast.success("Article ajouté avec succès.");
      } else if (modalMode === 'mouvement') {
        await StockService.createMouvement(formData);
        toast.success("Mouvement enregistré avec succès.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="stocks-page">
      <div className="stocks-header">
        <div>
          <h1>Gestion des Stocks</h1>
          <p>Suivez vos intrants, équipements et récoltes en temps réel.</p>
        </div>
      </div>

      <div className="stocks-tabs">
        <button 
          className={`tab-btn ${activeTab === 'inventaire' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventaire')}
        >
          <FaBoxOpen /> Inventaire
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <FaHistory /> Historique des mouvements
        </button>
      </div>

      <div className="tab-content-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              {activeTab === 'inventaire' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Inventaire Actuel</h2>
                    <button className="btn-add" onClick={() => handleOpenModal('article')}>
                      <FaPlus /> Nouvel Article
                    </button>
                  </div>
                  
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nom de l'article</th>
                          <th>Type</th>
                          <th>Stock Actuel</th>
                          <th>Emplacement</th>
                          <th>Mouvements Rapides</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.length === 0 ? (
                          <tr><td colSpan="5" className="text-center">Aucun article en stock.</td></tr>
                        ) : articles.map(art => {
                          const isLowStock = parseFloat(art.quantite_en_stock) <= parseFloat(art.seuil_alerte);
                          return (
                            <tr key={art.id} className={isLowStock ? 'low-stock-row' : ''}>
                              <td className="font-semibold">
                                {isLowStock && <FaExclamationTriangle className="alert-icon" title="Stock Faible" />}
                                {art.nom}
                              </td>
                              <td>{art.type_article}</td>
                              <td className={`stock-qty ${isLowStock ? 'text-danger' : ''}`}>
                                <span>{art.quantite_en_stock}</span> {art.unite_mesure}
                              </td>
                              <td>{art.emplacement || '-'}</td>
                              <td className="actions-cell">
                                <button className="btn-icon add-stock" onClick={() => handleOpenModal('mouvement', art.id, 'ENTREE')} title="Entrée">
                                  <FaPlus />
                                </button>
                                <button className="btn-icon remove-stock" onClick={() => handleOpenModal('mouvement', art.id, 'SORTIE')} title="Sortie">
                                  <FaMinus />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'historique' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Derniers Mouvements</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Article</th>
                          <th>Type</th>
                          <th>Quantité</th>
                          <th>Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouvements.length === 0 ? (
                          <tr><td colSpan="5" className="text-center">Aucun mouvement enregistré.</td></tr>
                        ) : mouvements.map(mvt => (
                          <tr key={mvt.id}>
                            <td>{mvt.date_mouvement}</td>
                            <td className="font-semibold">Article #{mvt.article}</td>
                            <td>
                              <span className={`mvt-badge ${mvt.type_mouvement.toLowerCase()}`}>
                                {mvt.type_mouvement}
                              </span>
                            </td>
                            <td>{mvt.quantite}</td>
                            <td>{mvt.motif || '-'}</td>
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
              <h2>{modalMode === 'article' ? "Nouvel Article" : "Enregistrer un mouvement"}</h2>
              <form onSubmit={handleSubmit} className="generic-form">
                
                {modalMode === 'article' ? (
                  <>
                    <div className="form-group">
                      <label>Nom de l'article</label>
                      <input type="text" name="nom" required onChange={handleChange} placeholder="Ex: Engrais NPK" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type d'article</label>
                        <select name="type_article" required onChange={handleChange} value={formData.type_article}>
                          <option value="INTRANT">Intrant (Engrais/Semences)</option>
                          <option value="RECOLTE">Récolte</option>
                          <option value="EQUIPEMENT">Équipement</option>
                          <option value="ALIMENTATION">Aliment bétail</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Unité de mesure</label>
                        <input type="text" name="unite_mesure" required onChange={handleChange} placeholder="kg, L, Sacs..." value={formData.unite_mesure} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantité initiale</label>
                        <input type="number" step="0.01" name="quantite_en_stock" required onChange={handleChange} value={formData.quantite_en_stock} />
                      </div>
                      <div className="form-group">
                        <label>Seuil d'alerte</label>
                        <input type="number" step="0.01" name="seuil_alerte" required onChange={handleChange} value={formData.seuil_alerte} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Emplacement</label>
                      <input type="text" name="emplacement" onChange={handleChange} placeholder="Magasin A" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Article ID</label>
                        <input type="number" name="article" required value={formData.article} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Type de mouvement</label>
                        <select name="type_mouvement" required value={formData.type_mouvement} onChange={handleChange}>
                          <option value="ENTREE">Entrée</option>
                          <option value="SORTIE">Sortie</option>
                          <option value="PERTE">Perte / Avarie</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Quantité</label>
                      <input type="number" step="0.01" name="quantite" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Motif / Raison</label>
                      <input type="text" name="motif" onChange={handleChange} placeholder="Ex: Livraison fournisseur" />
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
