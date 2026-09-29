import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TransitionProvider } from "./context/TransitionContext";
import PageLoader from "./Components/PageLoader";

// Page d'accueil publique
import Landing from "./Pages/Landing";

// Pages d'authentification
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// Pages Métier (Modules récents et consolidés)
import Dashboard from "./Pages/Dashboard";
import Profile from "./Pages/Profile";
import AdminDashboard from "./Pages/SuperAdmin/AdminDashboard";
import Exploitations from "./Pages/Exploitations";
import DetailExploitation from "./Pages/DetailExploitation";
import Team from "./Pages/Team/Team";
import DetailEmploye from "./Pages/DetailEmploye";
import Cultures from "./Pages/Cultures/Cultures";
import Elevage from "./Pages/Elevage/Elevage";
import Stocks from "./Pages/Stocks/Stocks";
import Transactions from "./Pages/transactions";
import Rapports from "./Pages/Rapports";
import Tracabilite from "./Pages/Tracabilite";
import AssistantIA from "./Pages/AssistantIA";
import Settings from "./Pages/Settings/Settings";

// Pages Espace Employé
import EmployeDashboard from "./Pages/EmployeDashboard";
import Taches from "./Pages/Taches";
import Activites from "./Pages/Activites";

// Composants de structure & sécurité
import ProtectedRoute from "./Components/ProtectedRoute";
import Layout from "./Components/Layout";

function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <PageLoader />
        <Routes>
          {/* =====================
              PAGES PUBLIQUES
          ====================== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* =====================
              PAGES PROTÉGÉES (AVEC LAYOUT)
          ====================== */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Profil utilisateur (accessible à tous les rôles authentifiés) */}
            <Route path="/profile" element={<Profile />} />

            {/* Propriétaire / Dashboard principal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "COMPTABLE"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Super Administrateur Plateforme */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_PLATFORME"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Gestion de l'exploitation & Paramètres */}
            <Route
              path="/exploitations"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <Exploitations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exploitation/:id"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parametres"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Équipe & Employés */}
            <Route
              path="/employes"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employe/:id"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <DetailEmploye />
                </ProtectedRoute>
              }
            />

            {/* Cultures & Élevage */}
            <Route
              path="/cultures"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "EMPLOYE", "COMPTABLE"]}>
                  <Cultures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elevage"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "EMPLOYE"]}>
                  <Elevage />
                </ProtectedRoute>
              }
            />

            {/* Stocks */}
            <Route
              path="/stocks"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "EMPLOYE"]}>
                  <Stocks />
                </ProtectedRoute>
              }
            />

            {/* Finances & Transactions */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "COMPTABLE"]}>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            {/* Rapports & Analytics */}
            <Route
              path="/rapports"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE", "COMPTABLE"]}>
                  <Rapports />
                </ProtectedRoute>
              }
            />

            {/* Traçabilité & Audit */}
            <Route
              path="/tracabilite"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <Tracabilite />
                </ProtectedRoute>
              }
            />

            {/* Assistant IA */}
            <Route
              path="/assistant-ia"
              element={
                <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                  <AssistantIA />
                </ProtectedRoute>
              }
            />

            {/* Espace Employé Terrain */}
            <Route
              path="/employe-dashboard"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYE"]}>
                  <EmployeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/taches"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYE", "PROPRIETAIRE"]}>
                  <Taches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activites"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYE", "PROPRIETAIRE"]}>
                  <Activites />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  );
}

export default App;