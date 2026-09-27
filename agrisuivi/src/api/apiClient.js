// =======================================================
// AgriSuivi - Client API centralisé
// Gestion JWT + SaaS Multi Tenant
// =======================================================


const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";




// =======================================================
// Fonction principale d'appel API
// =======================================================

export async function apiFetch(endpoint, options = {}) {


  const {

    tenantOverride,

    ...fetchOptions

  } = options;




  const token = localStorage.getItem(
    "access_token"
  );



  const tenant =

    tenantOverride ||

    localStorage.getItem(
      "tenant_schema"
    ) ||
    "public";





  // =====================================
  // Correction FormData
  // =====================================

  const headers = {};



  if(!(fetchOptions.body instanceof FormData)){


    headers["Content-Type"] =
      "application/json";


  }





  // Tenant SaaS

  if(
    tenant &&
    tenant !== "public"
  ){

    headers["X-Tenant-ID"] = tenant;

  }





  // JWT

  if(token){

    headers["Authorization"] =
      `Bearer ${token}`;

  }





  const config = {


    ...fetchOptions,


    headers:{


      ...headers,


      ...fetchOptions.headers


    }


  };






  // Intercept tenant-only endpoints if tenant is public
  const tenantEndpoints = [
    "/employes/", "/finances/", "/exploitation/", 
    "/cultures/", "/stocks/", "/tracabilite/", "/rapports/"
  ];
  if (tenant === "public" && tenantEndpoints.some(ep => endpoint.startsWith(ep))) {
    // If it's a GET request, return empty array to avoid breaking UI lists
    if (!config.method || config.method === "GET") {
        return [];
    }
    throw new Error("Action impossible sur le schéma public. Veuillez vous connecter à votre exploitation.");
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      config
    );

    // -----------------------------------------------
    // 401 : session expirée SAUF pour le login lui-même
    // (un mauvais mdp sur /auth/token/ retourne aussi 401)
    // -----------------------------------------------
    if (response.status === 401 && !endpoint.includes("/auth/token/")) {

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("currentUser");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    // -----------------------------------------------
    // Erreur HTTP (400, 401 login, 403, 404, 500…)
    // -----------------------------------------------
    if (response.status === 404) {
      if (endpoint === "/auth/token/") {
        throw new Error("Identifiant de l'exploitation incorrect ou introuvable.");
      }
      throw new Error("Ressource non trouvée (Erreur 404)");
    }

    if (!response.ok) {

      let errorData = {};
      try {
        errorData = await response.json();
      } catch (_) {}

      // Extraire le message d'erreur le plus précis possible
      let message = "";

      if (errorData.detail) {
        // Message DRF standard
        message = errorData.detail;
      } else if (errorData.error) {
        message = errorData.error;
      } else if (errorData.non_field_errors) {
        // Erreurs non liées à un champ spécifique
        message = Array.isArray(errorData.non_field_errors)
          ? errorData.non_field_errors.join(" ")
          : errorData.non_field_errors;
      } else {
        // Erreurs de validation DRF sur des champs : {"email": ["..."], "schema_name": ["..."]}
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => {
            const msg = Array.isArray(errors) ? errors.join(", ") : String(errors);
            return `${field} : ${msg}`;
          })
          .join(" | ");

        message = fieldErrors || `Erreur ${response.status}`;
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();

  } catch (error) {

    console.error("Erreur API :", endpoint, error);

    // Erreur réseau : le serveur est inaccessible (502, connexion refusée, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
    }

    throw error;

  }

}


export const NotificationService = {
  getNotifications: () => apiFetch('/tracabilite/notifications/'),
  markAsRead: (id) => apiFetch(`/tracabilite/notifications/${id}/read/`, { method: 'PATCH' })
};

// =======================================================
// AUTHENTIFICATION
// =======================================================


export const AuthService = {


 login: async (credentials, tenantSchema) => {

   const fetchOptions = {

     method: "POST",

     body: JSON.stringify(credentials),

   };

   // Ne passer tenantOverride que si tenantSchema est explicitement fourni

   if (tenantSchema) {

     fetchOptions.tenantOverride = tenantSchema;

   }

   const data =

    await apiFetch(

      "/auth/token/",

      fetchOptions

    );



   if (data.access) {


    localStorage.setItem(

      "access_token",

      data.access

    );



    localStorage.setItem(

      "refresh_token",

      data.refresh

    );



    localStorage.setItem(

      "currentUser",

      JSON.stringify(data.user)

    );

    if (data.tenant_schema) {
      localStorage.setItem("tenant_schema", data.tenant_schema);
    }


   }



   return data;


 },






 registerTenant:

 async(data)=>{


 return apiFetch(

   "/tenants/register/",


   {

    method:"POST",


    body:
    JSON.stringify(data),


    tenantOverride:"public"


   }


 );


 },








 getCurrentUser:

 async()=>{


 return apiFetch(

   "/auth/me/"

 );


 },








 logout: async () => {
   try {
     const refreshToken = localStorage.getItem("refresh_token");
     if (refreshToken) {
       await apiFetch("/auth/token/logout/", {
         method: "POST",
         body: JSON.stringify({ refresh: refreshToken })
       });
     }
   } catch (error) {
     console.error("Erreur lors de la déconnexion backend:", error);
   } finally {
     localStorage.clear();
     window.location.href="/login";
   }
 },

 updateProfile: async (data) => {
   return apiFetch("/auth/me/", {
     method: "PUT",
     body: JSON.stringify(data)
   });
 },

 resetPasswordRequest: async (data, tenantSchema = 'public') => {
   return apiFetch("/auth/password-reset/", {
     method: "POST",
     body: JSON.stringify(data),
     tenantOverride: tenantSchema
   });
 },

 resetPasswordConfirm: async (data, tenantSchema = 'public') => {
   return apiFetch("/auth/password-reset/confirm/", {
     method: "POST",
     body: JSON.stringify(data),
     tenantOverride: tenantSchema
   });
 },

 sendPhoneOTP: async () => {
   return apiFetch("/auth/phone-otp/send/", {
     method: "POST"
   });
 },

 verifyPhoneOTP: async (data) => {
   return apiFetch("/auth/phone-otp/verify/", {
     method: "POST",
     body: JSON.stringify(data)
   });
 }

};







// =======================================================
// EXPLOITATIONS (Alias vers ParametresExploitation)
// Dans notre architecture multi-tenant, 1 locataire = 1 exploitation
// =======================================================

export const ExploitationService = {
  getAll: async () => {
    const params = await ParametresService.getParams();
    return [params];
  },

  getById: async (id) => {
    return await ParametresService.getParams();
  },

  create: async (data) => {
    // "Créer" équivaut à mettre à jour les paramètres initiaux
    return await ParametresService.updateParams(data);
  },

  update: async (id, data) => {
    return await ParametresService.updateParams(data);
  },

  delete: async (id) => {
    throw new Error("Impossible de supprimer l'exploitation principale via cet endpoint.");
  }
};


// =======================================================
// DASHBOARD
// =======================================================


export const DashboardService = {


getStats:()=>{


return apiFetch(

"/rapports/dashboard/"

);


}



};








// =======================================================
// EMPLOYES
// =======================================================


export const EmployesService = {



getAll:()=>{


return apiFetch(

"/employes/list/"

);


},





getById:(id)=>{


return apiFetch(

`/employes/list/${id}/`

);


},





create:(data)=>{


return apiFetch(

"/employes/list/",


{

method:"POST",

body:JSON.stringify(data)


}


);


},





update:(id,data)=>{


return apiFetch(

`/employes/list/${id}/`,


{

method:"PUT",

body:JSON.stringify(data)


}


);


},





delete:(id)=>{


return apiFetch(

`/employes/list/${id}/`,


{

method:"DELETE"


}


);


}



};









// =======================================================
// CULTURES
// =======================================================









// =======================================================
// CULTURES
// =======================================================


// =======================================================
// FINANCES
// =======================================================


export const FinancesService = {



getAll:()=>{


return apiFetch(

"/finances/list/"

);


},





getBilan:()=>{


return apiFetch(

"/finances/bilan/"

);


},





create: (data) => {
  const isFormData = data instanceof FormData;
  const options = {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
  }
  return apiFetch("/finances/list/", options);
}



};









// =======================================================
// TRACABILITE
// =======================================================


export const TracabiliteService = {



getLogs:()=>{


return apiFetch(

"/tracabilite/logs/"

);


}



};









// =======================================================
// PARAMETRES EXPLOITATION
// =======================================================


export const ParametresService = {



  getParams: () => {
    return apiFetch(`/exploitation/parametres/?t=${Date.now()}`);
  },





updateParams: (data) => {
  return apiFetch(
    "/exploitation/parametres/",
    {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data)
    }
  );
}



};

// =======================================================
// SUPER ADMIN
// =======================================================

export const SuperAdminService = {
  getPlatformStats: () => {
    return apiFetch("/tenants/stats/", { tenantOverride: "public" });
  },

  getAllClients: () => {
    return apiFetch("/tenants/list/", { tenantOverride: "public" });
  },

  updateClientStatus: (id, isActive) => {
    return apiFetch(`/tenants/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
      tenantOverride: "public"
    });
  },

  sendGlobalNotification: (message) => {
    return apiFetch(`/tenants/notify/`, {
      method: "POST",
      body: JSON.stringify({ message }),
      tenantOverride: "public"
    });
  }
};


// =====================================
// EMPLOYES (Gestion de l'équipe)
// =====================================
export const EmployeService = {
  getAllEmployes: () => {
    return apiFetch("/employes/list/");
  },
  
  createEmploye: (data) => {
    return apiFetch("/employes/list/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  
  updateEmploye: (id, data) => {
    return apiFetch(`/employes/list/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },
  
  deleteEmploye: (id) => {
    return apiFetch(`/employes/list/${id}/`, {
      method: "DELETE"
    });
  },

  getPointages: () => apiFetch("/employes/pointages/"),
  createPointage: (data) => apiFetch("/employes/pointages/", { method: "POST", body: JSON.stringify(data) }),
  deletePointage: (id) => apiFetch(`/employes/pointages/${id}/`, { method: "DELETE" })
};

// =====================================
// CULTURES ET ÉLEVAGE
// =====================================
export const CultureService = {
  // Parcelles
  getParcelles: () => apiFetch("/cultures/parcelles/"),
  createParcelle: (data) => apiFetch("/cultures/parcelles/", { method: "POST", body: JSON.stringify(data) }),
  updateParcelle: (id, data) => apiFetch(`/cultures/parcelles/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteParcelle: (id) => apiFetch(`/cultures/parcelles/${id}/`, { method: "DELETE" }),

  // Cultures
  getCultures: () => apiFetch("/cultures/list/"),
  createCulture: (data) => apiFetch("/cultures/list/", { method: "POST", body: JSON.stringify(data) }),
  updateCulture: (id, data) => apiFetch(`/cultures/list/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCulture: (id) => apiFetch(`/cultures/list/${id}/`, { method: "DELETE" }),

  // Elevage
  getElevages: () => apiFetch("/cultures/elevages/"),
  createElevage: (data) => apiFetch("/cultures/elevages/", { method: "POST", body: JSON.stringify(data) }),
  updateElevage: (id, data) => apiFetch(`/cultures/elevages/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteElevage: (id) => apiFetch(`/cultures/elevages/${id}/`, { method: "DELETE" }),

  // Activités
  getActivites: () => 
    apiFetch("/cultures/activites/"),

  createActivite: (data) => 
    apiFetch("/cultures/activites/", {
      method: "POST",
      body: data instanceof FormData
        ? data
        : JSON.stringify(data)
    }),

  updateActivite: (id, data) => 
    apiFetch(`/cultures/activites/${id}/`, {
      method: "PATCH",
      body: data instanceof FormData
        ? data
        : JSON.stringify(data)
    }),

  deleteActivite: (id) => 
    apiFetch(`/cultures/activites/${id}/`, {
      method: "DELETE"
    })
};

// =====================================
// STOCKS
// =====================================
export const StocksService = {
  // Catégories
  getCategories: () => apiFetch("/stocks/categories/"),
  
  // Articles
  getArticles: () => apiFetch("/stocks/articles/"),
  createArticle: (data) => apiFetch("/stocks/articles/", { method: "POST", body: JSON.stringify(data) }),
  updateArticle: (id, data) => apiFetch(`/stocks/articles/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteArticle: (id) => apiFetch(`/stocks/articles/${id}/`, { method: "DELETE" }),

  // Mouvements
  getMouvements: () => apiFetch("/stocks/mouvements/"),
  createMouvement: (data) => apiFetch("/stocks/mouvements/", { method: "POST", body: JSON.stringify(data) }),
};

export const StockService = StocksService;