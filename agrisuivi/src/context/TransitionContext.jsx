import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const TransitionContext = createContext(null);

export const TransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * navigateTo(path) : déclenche l'animation de transition puis navigue
   */
  const triggerTransition = useCallback((navigateFn, path) => {
    setIsTransitioning(true);
    setProgress(0);

    // Animation de la barre : 0 → 80% rapidement, puis 80 → 100% à la fin
    let current = 0;
    const step = () => {
      current += Math.random() * 18 + 8; // avance aléatoirement
      if (current < 80) {
        setProgress(current);
        setTimeout(step, 120 + Math.random() * 80);
      } else {
        setProgress(80);
      }
    };
    step();

    // Après 1.2s → complétion + navigation
    setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        navigateFn(path);
        setTimeout(() => {
          setIsTransitioning(false);
          setProgress(0);
        }, 300);
      }, 250);
    }, 1200);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, progress, triggerTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
};

/**
 * Hook pratique : retourne une fonction navigateWithTransition(path)
 */
export const useTransitionNavigate = () => {
  const navigate = useNavigate();
  const { triggerTransition } = useTransition();
  return (path, options = {}) => {
    if (options.fullScreen) {
      triggerTransition(navigate, path);
    } else {
      navigate(path);
    }
  };
};
