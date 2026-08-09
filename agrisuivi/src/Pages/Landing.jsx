import React from "react";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaTractor,
  FaUsers,
  FaChartLine,
  FaArrowRight,
  FaShieldAlt,
  FaBox,
  FaCheckCircle,
  FaMobileAlt,
  FaCloud
} from "react-icons/fa";
import { useTransitionNavigate } from "../context/TransitionContext";
import "./Landing.css";

function Landing() {
  const navigate = useTransitionNavigate();

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12, duration: 0.8 }
    }
  };

  const features = [
    {
      icon: <FaTractor />,
      title: "Gestion d'Exploitation",
      desc: "Suivez vos parcelles, cultures et élevages en temps réel avec des outils précis."
    },
    {
      icon: <FaBox />,
      title: "Suivi des Stocks",
      desc: "Gérez vos inventaires d'intrants et de récoltes avec alertes de seuil."
    },
    {
      icon: <FaUsers />,
      title: "Gestion des Employés",
      desc: "Assignez des tâches et suivez l'activité de vos équipes agricoles."
    },
    {
      icon: <FaChartLine />,
      title: "Analyses & Rapports",
      desc: "Visualisez vos rendements et finances grâce à des tableaux de bord dynamiques."
    }
  ];

  return (
    <div className="premium-landing">
      {/* Navbar */}
      <nav className="landing-nav glass-nav">
        <motion.div 
          className="brand"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="brand-logo"><FaLeaf /></div>
          <span className="brand-text">AgriSuivi</span>
        </motion.div>
        
        <motion.div 
          className="nav-actions"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <button className="btn-ghost" onClick={() => navigate("/login")}>Se connecter</button>
          <button className="btn-glow" onClick={() => navigate("/register")}>Essai Gratuit</button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        
        <div className="hero-container">
          <motion.div 
            className="hero-text"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="badge-pill">
              <span className="badge-icon"><FaShieldAlt /></span>
              <span className="badge-text">Plateforme SaaS Multi-Tenant sécurisée</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="hero-title">
              L'agriculture moderne,<br />
              <span className="text-gradient">pilotée par la donnée</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="hero-desc">
              Propulsez votre exploitation vers l'avenir. Gérez vos parcelles, vos équipes, et vos rendements depuis une plateforme unique et intuitive.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="hero-cta">
              <button className="btn-primary-large" onClick={() => navigate("/register")}>
                Démarrer maintenant <FaArrowRight />
              </button>
              <div className="hero-guarantee">
                <FaCheckCircle /> Sans engagement de durée
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            <div className="dashboard-mockup glass-card">
              <div className="mockup-header">
                <div className="dots"><span/><span/><span/></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar"></div>
                <div className="mockup-content">
                  <div className="mockup-card top-card"></div>
                  <div className="mockup-grid">
                    <div className="mockup-card"></div>
                    <div className="mockup-card"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements for 3D effect */}
              <motion.div 
                className="floating-widget widget-1 glass-card"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaChartLine className="widget-icon success" />
                <div className="widget-text">
                  <div className="widget-value">+24%</div>
                  <div className="widget-label">Rendement</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="floating-widget widget-2 glass-card"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <FaCloud className="widget-icon info" />
                <div className="widget-text">
                  <div className="widget-value">Cloud Sync</div>
                  <div className="widget-label">Temps réel</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">Une suite d'outils <span className="text-gradient">complète</span></h2>
            <p className="section-desc">Conçu spécifiquement pour répondre aux exigences des exploitations agricoles modernes.</p>
          </motion.div>

          <motion.div 
            className="features-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feat, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="feature-card glass-card">
                <div className="feat-icon-wrapper">
                  {feat.icon}
                  <div className="icon-glow"></div>
                </div>
                <h3 className="feat-title">{feat.title}</h3>
                <p className="feat-desc">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-container glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Prêt à transformer votre exploitation ?</h2>
          <p>Rejoignez les agriculteurs qui optimisent leur production avec AgriSuivi.</p>
          <button className="btn-glow-large" onClick={() => navigate("/register")}>
            Créer mon compte gratuitement
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <FaLeaf className="footer-logo" /> AgriSuivi
          </div>
          <div className="footer-links">
            <span>© {new Date().getFullYear()} Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
