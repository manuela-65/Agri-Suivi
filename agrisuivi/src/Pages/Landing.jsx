import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaArrowRight,
  FaStar,
  FaPlay,
  FaCheckCircle,
  FaShieldAlt,
  FaTractor,
  FaBoxes,
  FaUsers,
  FaChartLine,
  FaSearch,
  FaVideo,
  FaSun,
  FaCloudRain,
  FaGlobeAmericas
} from "react-icons/fa";
import { useTransitionNavigate } from "../context/TransitionContext";
import "./Landing.css";

function Landing() {
  const navigate = useTransitionNavigate();
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <div className="landscape-landing">
      {/* 1. FLOATING PILL NAVBAR */}
      <header className="navbar-container">
        <nav className="floating-navbar">
          <div className="nav-brand" onClick={() => navigate("/")}>
            <div className="brand-icon-circle">
              <FaLeaf />
            </div>
            <span className="brand-name">AgriSuivi</span>
          </div>

          <ul className="nav-links">
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#showcase">Innovation</a></li>
            <li><a href="#impact">Notre Impact</a></li>
            <li><a href="#features">Fonctionnalités</a></li>
          </ul>

          <div className="nav-actions">
            <button 
              type="button" 
              className="btn-nav-login" 
              onClick={() => navigate("/login")}
            >
              Connexion
            </button>
            <button 
              type="button" 
              className="btn-nav-primary" 
              onClick={() => navigate("/register")}
            >
              Démarrer l'essai
            </button>
          </div>
        </nav>
      </header>

      {/* 2. HERO SECTION IMMERSIVE */}
      <section className="hero-section">
        <div className="hero-background-image" style={{ backgroundImage: "url('/assets/greenhouse-sprouts.jpg')" }}>
          <div className="hero-gradient-overlay" />
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-main-column">
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge-dot" />
              <span>Agriculture Connectée & Durable</span>
            </motion.div>

            <motion.h1 
              className="hero-headline"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Sustainable Farming for a Thriving Future
            </motion.h1>

            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Nous équipons les exploitants avec des outils technologiques de pointe pour optimiser les récoltes, certifier la traçabilité des parcelles et piloter les équipes en toute simplicité.
            </motion.p>

            <motion.div 
              className="hero-cta-group"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <button 
                type="button" 
                className="btn-hero-primary"
                onClick={() => navigate("/register")}
              >
                <span>Explorer nos Solutions</span>
                <span className="btn-circle-arrow"><FaArrowRight /></span>
              </button>

              <div className="hero-rating-box">
                <div className="stars-row">
                  <span className="rating-number">4.9</span>
                  <div className="stars-icons">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>
                <span className="rating-label">1 450+ avis d'exploitants certifiés</span>
              </div>
            </motion.div>
          </div>

          {/* Floating cards on the hero visual right */}
          <div className="hero-floating-cards">
            {/* Video preview card */}
            <motion.div 
              className="hero-floating-card video-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              whileHover={{ y: -4 }}
              onClick={() => setIsPlayingVideo(!isPlayingVideo)}
            >
              <div className="video-card-thumb" style={{ backgroundImage: "url('/assets/tractor-field.jpg')" }}>
                <div className="video-play-btn">
                  <FaPlay />
                </div>
              </div>
            </motion.div>

            {/* Live sensor / data floating card */}
            <motion.div 
              className="hero-floating-card info-card glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              whileHover={{ y: -4 }}
            >
              <div className="info-card-icon-circle">
                <FaSun />
              </div>
              <div className="info-card-text">
                <strong>Surveillance Sols & Climats</strong>
                <p>Contrôle précis de l'irrigation et alertes phytosanitaires instantanées.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Brand logos ticker bar */}
        <div className="hero-partners-bar">
          <div className="partners-inner">
            <span className="partner-logo">🌱 AgroTerra</span>
            <span className="partner-logo">🌾 BioHarvest</span>
            <span className="partner-logo">🚜 GreenCult</span>
            <span className="partner-logo">🌿 EcoFarm</span>
            <span className="partner-logo">🌍 TerraNova</span>
            <span className="partner-logo">📊 InnoAgri</span>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE GALLERY SECTION (Directly matching user image) */}
      <section id="showcase" className="showcase-section">
        <div className="showcase-header">
          <h2>
            Showcasing the Beauty and Innovation of<br />
            <strong>Sustainable Agriculture</strong> <span className="text-muted-headline">Through Stunning Visuals and Inspiring Imagery</span>
          </h2>
        </div>

        <div className="showcase-bento-grid">
          {/* Card 1: Large Vertical Left */}
          <motion.div 
            className="bento-card bento-tall"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundImage: "url('/assets/tractor-field.jpg')" }}
          >
            <div className="bento-card-overlay">
              <span className="bento-badge">Mécanisation Raisonnée</span>
              <p className="bento-caption">
                Préparation et travail du sol au coucher de soleil pour préserver l'humidité et la vie microbienne des parcelles.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Top Wide Right */}
          <motion.div 
            className="bento-card bento-wide"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundImage: "url('/assets/greenhouse-sprouts.jpg')" }}
          >
            <div className="bento-card-overlay">
              <span className="bento-badge">Cultures Sous Abri & Maraîchage</span>
              <p className="bento-caption">
                Surveillance continue du microclimat des serres pour garantir des récoltes biologiques vigoureuses et saines.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Bottom Small 1 */}
          <motion.div 
            className="bento-card bento-small"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundImage: "url('/assets/tractor-field.jpg')" }}
          >
            <div className="bento-card-overlay">
              <span className="bento-badge">Gestion Énergétique</span>
              <p className="bento-caption">
                Optimisation des trajectoires machines et réduction de l'empreinte carbone.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Bottom Small 2 */}
          <motion.div 
            className="bento-card bento-small"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundImage: "url('/assets/greenhouse-sprouts.jpg')" }}
          >
            <div className="bento-card-overlay">
              <span className="bento-badge">Traçabilité Certifiée</span>
              <p className="bento-caption">
                Enregistrement horodaté avec preuve vidéo de chaque soin et intervention culturale.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. IMPACT IN NUMBERS SECTION */}
      <section id="impact" className="impact-section">
        <div className="impact-header-row">
          <div className="impact-title-group">
            <h2>Our Impact <span className="text-light">in Numbers</span></h2>
          </div>
          <div className="impact-description-text">
            <p>
              Notre engagement envers une agriculture productive et respectueuse de l'environnement génère des résultats mesurables, des exploitations plus résilientes et une rentabilité accrue.
            </p>
          </div>
        </div>

        <div className="impact-stats-grid">
          <div className="impact-stat-item">
            <h3 className="impact-number">8K+</h3>
            <span className="impact-label">Exploitants Accompagnés</span>
          </div>

          <div className="impact-stat-item">
            <h3 className="impact-number">3M+</h3>
            <span className="impact-label">Hectares Cultivés & Suivis</span>
          </div>

          <div className="impact-stat-item">
            <h3 className="impact-number">+28%</h3>
            <span className="impact-label">Hausse Moyenne du Rendement</span>
          </div>

          <div className="impact-stat-item">
            <h3 className="impact-number">50K+</h3>
            <span className="impact-label">Tonnes de Récoltes Certifiées</span>
          </div>
        </div>
      </section>

      {/* 5. CORE SOLUTIONS BENTO SECTION */}
      <section id="solutions" className="solutions-section">
        <div className="solutions-header">
          <span className="section-pill">Modules Tout-en-Un</span>
          <h2>Une solution globale pour chaque facette de votre exploitation</h2>
          <p>Conçue sur le terrain avec des exploitants et agronomes expérimentés.</p>
        </div>

        <div className="solutions-grid">
          <div className="solution-card">
            <div className="sol-icon-box green"><FaLeaf /></div>
            <h3>Parcelles & Cycles de Culture</h3>
            <p>Cartographiez vos champs, planifiez vos assolements et suivez le développement des cultures en temps réel.</p>
          </div>

          <div className="solution-card">
            <div className="sol-icon-box blue"><FaTractor /></div>
            <h3>Cheptel & Santé Animale</h3>
            <p>Registres sanitaires, traçabilité des naissances, soins vétérinaires et gestion des effectifs d'élevage.</p>
          </div>

          <div className="solution-card">
            <div className="sol-icon-box orange"><FaBoxes /></div>
            <h3>Stocks d'Intrants & Récoltes</h3>
            <p>Alertes automatiques sous le seuil critique, inventaires valorisés et gestion des entrées/sorties en 1 clic.</p>
          </div>

          <div className="solution-card">
            <div className="sol-icon-box purple"><FaUsers /></div>
            <h3>Équipe Terrain & Pointages</h3>
            <p>Feuille de présence instantanée, attribution des tâches quotidiennes et suivi précis des heures travaillées.</p>
          </div>

          <div className="solution-card">
            <div className="sol-icon-box yellow"><FaChartLine /></div>
            <h3>Trésorerie & Marges Nettes</h3>
            <p>Bilan recettes/dépenses, comptes d'exploitation par parcelle et exports certifiés PDF et Excel.</p>
          </div>

          <div className="solution-card">
            <div className="sol-icon-box red"><FaShieldAlt /></div>
            <h3>Traçabilité Vidéo & Sécurité</h3>
            <p>Architecture Multi-Tenant étanche, journal d'audit infalsifiable avec preuves vidéo certifiées.</p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="cta-banner-section">
        <div className="cta-banner-card" style={{ backgroundImage: "linear-gradient(rgba(6, 78, 59, 0.92), rgba(6, 78, 59, 0.92)), url('/assets/tractor-field.jpg')" }}>
          <div className="cta-banner-content">
            <h2>Prêt à digitaliser et rentabiliser votre exploitation ?</h2>
            <p>Rejoignez des milliers de producteurs modernes. Commencez gratuitement dès aujourd'hui sans carte de crédit.</p>
            <div className="cta-banner-buttons">
              <button 
                type="button" 
                className="btn-cta-white" 
                onClick={() => navigate("/register")}
              >
                Créer mon compte gratuitement <FaArrowRight />
              </button>
              <button 
                type="button" 
                className="btn-cta-outline" 
                onClick={() => navigate("/login")}
              >
                Espace Connexion
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODERN CLEAN FOOTER */}
      <footer className="landscape-footer">
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <FaLeaf /> <span>AgriSuivi</span>
            </div>
            <p>La référence SaaS de gestion agronomique, traçabilité certifiée et rentabilité pour les exploitations agricoles d'aujourd'hui et de demain.</p>
          </div>

          <div className="footer-links-col">
            <h4>Plateforme</h4>
            <a href="#solutions">Solutions</a>
            <a href="#showcase">Innovations</a>
            <a href="#impact">Impact</a>
            <a href="#features">Fonctionnalités</a>
          </div>

          <div className="footer-links-col">
            <h4>Espaces</h4>
            <span onClick={() => navigate("/login")}>Connexion Gestionnaire</span>
            <span onClick={() => navigate("/login")}>Espace Opérateur Terrain</span>
            <span onClick={() => navigate("/register")}>Créer une Exploitation</span>
          </div>

          <div className="footer-links-col">
            <h4>Sécurité & Normes</h4>
            <span>Multi-Tenant Isolé</span>
            <span>Chiffrement AES-256</span>
            <span>RGPD & Confidentialité</span>
          </div>
        </div>

        <div className="footer-bottom-row">
          <span>© {new Date().getFullYear()} AgriSuivi Inc. Tous droits réservés.</span>
          <span>Développé pour l'excellence agricole.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
