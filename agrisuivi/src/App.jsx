import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TransitionProvider } from "./context/TransitionContext";
import PageLoader from "./Components/PageLoader";

// Page d'accueil publique
import Landing from "./Pages/Landing";

// Pages principales
import Dashboard from "./Pages/Dashboard";
import Exploitations from "./Pages/Exploitations";
import DetailExploitation from "./Pages/DetailExploitation";
import Employes from "./Pages/employes";
import Transactions from "./Pages/transactions";
import Rapports from "./Pages/Rapports";
import Tracabilite from "./Pages/Tracabilite";
import DetailEmploye from "./Pages/DetailEmploye";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Profile from "./Pages/Profile";
import AdminDashboard from "./Pages/SuperAdmin/AdminDashboard";
import Settings from './Pages/Settings/Settings';
import Team from './Pages/Team/Team';
import Cultures from './Pages/Cultures/Cultures';
import Elevage from './Pages/Elevage/Elevage';
import Stocks from './Pages/Stocks/Stocks';
import AssistantIA from './Pages/AssistantIA';


// Pages employé
import EmployeDashboard from "./Pages/EmployeDashboard";
import Taches from "./Pages/Taches";
import Activites from "./Pages/Activites";


// Components
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

<Route
  path="/login"
  element={<Login />}
/>

<Route
  path="/register"
  element={<Register />}
/>

<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

<Route
  path="/employe/:id"
  element={<DetailEmploye />}
/>


        <Route
          path="/"
          element={<Landing />}
        />

        {/* =====================
            PAGES PROTEGEES (App)
        ====================== */}
        {/* Routes avec Layout pour les tenants */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="EMPLOYE">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/parametres" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/employes" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <Team />
            </ProtectedRoute>
          } />

          <Route path="/cultures" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <Cultures />
            </ProtectedRoute>
          } />

          <Route path="/elevage" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <Elevage />
            </ProtectedRoute>
          } />

          <Route path="/stocks" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <Stocks />
            </ProtectedRoute>
          } />

          <Route path="/assistant-ia" element={
            <ProtectedRoute requiredRole="PROPRIETAIRE">
              <AssistantIA />
            </ProtectedRoute>
          } />

        </Route>
        
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >



          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/super-admin"
            element={<AdminDashboard />}
          />





          <Route

            path="/exploitations"

            element={<Exploitations />}

          />





          <Route

            path="/exploitation/:id"

            element={<DetailExploitation />}

          />






          <Route

            path="/employes"

            element={<Employes />}

          />






          <Route

            path="/cultures"

            element={<Cultures />}

          />






          <Route

            path="/stocks"

            element={<Stocks />}

          />






          <Route

            path="/transactions"

            element={<Transactions />}

          />






          <Route

            path="/rapports"

            element={<Rapports />}

          />






          <Route
            path="/tracabilite"
            element={
              <ProtectedRoute allowedRoles={["PROPRIETAIRE"]}>
                <Tracabilite />
              </ProtectedRoute>
            }
          />







          {/* ESPACE EMPLOYE */}



          <Route

            path="/employe-dashboard"

            element={<EmployeDashboard />}

          />





          <Route

            path="/taches"

            element={<Taches />}

          />





          <Route

            path="/activites"

            element={<Activites />}

          />


        </Route>

        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  );

}



export default App;