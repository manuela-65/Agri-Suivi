import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, ParametresService } from '../api/apiClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tenant, setTenant] = useState(() => localStorage.getItem('tenant_schema') || 'public');
  const [loading, setLoading] = useState(false);
  
  // Nouveaux états pour les paramètres globaux (logo, nom, couleurs)
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : null;
  });

  const refreshSettings = async () => {
    if (user && tenant && tenant !== 'public') {
      try {
        const data = await ParametresService.getParams();
        setSettings(data);
        localStorage.setItem('appSettings', JSON.stringify(data));
      } catch (err) {
        console.error("Erreur chargement paramètres:", err);
      }
    }
  };

  // Charge les paramètres quand l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      if (user.role !== 'ADMIN_PLATFORME' && tenant === 'public') {
        toast.error("Vous êtes connecté sur le schéma public. Veuillez vous déconnecter et utiliser l'identifiant de votre exploitation.");
        logout();
      } else {
        refreshSettings();
      }
    } else {
      setSettings(null);
      localStorage.removeItem('appSettings');
    }
  }, [user, tenant]);

  const login = async (email, password, tenantSchema = 'public') => {
    setLoading(true);
    try {
      localStorage.setItem('tenant_schema', tenantSchema);
      setTenant(tenantSchema);
      const data = await AuthService.login(
        { username: email, password },
        tenantSchema
      );
      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerTenant = async (tenantData) => {
    setLoading(true);
    try {
      const response = await AuthService.registerTenant(tenantData);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (newTenantSchema) => {
    localStorage.setItem('tenant_schema', newTenantSchema);
    setTenant(newTenantSchema);
    // reload the page to ensure all contexts and API clients use the new tenant
    window.location.reload();
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, tenant, loading, settings, login, registerTenant, logout, refreshSettings, switchTenant }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
};
