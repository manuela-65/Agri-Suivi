import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import { useTransition } from "../context/TransitionContext";
import "./PageLoader.css";

function PageLoader() {
  const { isTransitioning, progress } = useTransition();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="page-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Logo central */}
          <motion.div
            className="page-loader-logo"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="page-loader-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaLeaf />
            </motion.div>
            <span className="page-loader-brand">AgriSuivi</span>
          </motion.div>

          {/* Texte de chargement */}
          <motion.p
            className="page-loader-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Chargement en cours…
          </motion.p>

          {/* Barre de progression */}
          <div className="page-loader-bar-container">
            <motion.div
              className="page-loader-bar-fill"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            {/* Reflet animé sur la barre */}
            <div className="page-loader-bar-shine" />
          </div>

          {/* Pourcentage */}
          <motion.span
            className="page-loader-percent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {Math.round(progress)}%
          </motion.span>

          {/* Particules décoratives */}
          <div className="page-loader-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
