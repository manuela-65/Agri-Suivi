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

    if (response.status === 404) {
      if (endpoint === "/auth/token/") {
        throw new Error("Identifiant de l'exploitation incorrect ou introuvable.");
      }
      console.error(`API Error: ${endpoint}`, new Error("Erreur 404"));
      throw new Error("Ressource non trouvée (Erreur 404)");
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();

  } catch (error) {

    console.error("Erreur API :", endpoint, error);
    throw error;

  }

}


// =======================================================
// AUTHENTIFICATION
// =======================================================


export const AuthService = {


 login: async (credentials, tenantSchema) => {

   const data =

    await apiFetch(

      "/auth/token/",

      {

        method: "POST",

        body:
        JSON.stringify(credentials),

        tenantOverride: tenantSchema || "public"

      }

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








 logout:()=>{


 localStorage.clear();


 window.location.href="/login";


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
// STOCKS
// =======================================================


export const StocksService = {



getAll:()=>{


return apiFetch(

"/stocks/articles/"

);


},





create:(data)=>{


return apiFetch(

"/stocks/articles/",


{

method:"POST",

body:JSON.stringify(data)


}


);


},





addMouvement:(data)=>{
return apiFetch("/stocks/mouvements/",{method:"POST",body:JSON.stringify(data)});
},

delete:(id)=>{
return apiFetch(`/stocks/articles/${id}/`,{method:"DELETE"});
}

};









// =======================================================
// CULTURES
// =======================================================


export const CulturesService = {



getCultures:()=>{


return apiFetch(

"/cultures/list/"

);


},





    getParcelles:()=>{
        return apiFetch("/cultures/parcelles/");
    },

    createParcelle:(data)=>{
        return apiFetch("/cultures/parcelles/", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },





    getElevages:()=>{
        return apiFetch("/cultures/elevages/");
    },

    createCulture:(data)=>{
        return apiFetch("/cultures/list/", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    createElevage:(data)=>{
        return apiFetch("/cultures/elevages/", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    deleteCulture:(id)=>{
        return apiFetch(`/cultures/list/${id}/`, {
            method: "DELETE"
        });
    },

    deleteElevage:(id)=>{
        return apiFetch(`/cultures/elevages/${id}/`, {
            method: "DELETE"
        });
    },





getActivites:()=>{


return apiFetch(

"/cultures/activites/"

);


}



};









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





create:(data)=>{
return apiFetch(
"/finances/list/",
{
 method:"POST",
 body:JSON.stringify(data),
 headers:{
     "Content-Type": "application/json"
 }
}
);
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