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
import Stocks from "./Pages/stocks";
import Transactions from "./Pages/transactions";
import Cultures from "./Pages/Cultures";
import Rapports from "./Pages/Rapports";
import Tracabilite from "./Pages/Tracabilite";
import Parametres from "./Pages/Parametres";
import DetailEmploye from "./Pages/DetailEmploye";
import Login from "./Pages/Login";
import Register from "./Pages/Register";



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

            element={<Tracabilite />}

          />






          <Route

            path="/parametres"

            element={<Parametres />}

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