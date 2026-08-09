import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  const currentUser = user || JSON.parse(localStorage.getItem("currentUser"));

  // Redirige vers /login si non authentifié
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirige vers /dashboard si le rôle n'est pas autorisé
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;