import React, { useState } from "react";

import {
  FaTasks,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";

import "../Styles/Taches.css";


function Taches(){


const user = JSON.parse(
  localStorage.getItem("currentUser")
);



const [taches,setTaches] = useState(()=>{

const data = localStorage.getItem("taches");

return data ? JSON.parse(data) : [];

});





const terminerTache = (index)=>{


const nouvelleListe = taches.map((tache,i)=>{

if(i===index){

return {

...tache,

statut:"Terminée"

};

}


return tache;


});



setTaches(nouvelleListe);



localStorage.setItem(

"taches",

JSON.stringify(nouvelleListe)

);


};







const mesTaches = taches.filter(

(tache)=>

tache.employe === user?.email

);







return (

<div className="taches-page">



<div className="page-header">


<div>

<h1>
Mes tâches
</h1>


<p>
Consultez les tâches qui vous sont attribuées
</p>


</div>



<div className="task-icon">

<FaTasks/>

</div>



</div>







<div className="tasks-container">


{

mesTaches.length === 0 ?


<div className="empty-task">


<FaClock/>


<h3>
Aucune tâche disponible
</h3>


<p>
Les tâches attribuées par votre responsable apparaîtront ici.
</p>


</div>



:


mesTaches.map((tache,index)=>(


<div className="task-card" key={index}>


<div>


<h3>

{tache.titre}

</h3>


<p>

{tache.description}

</p>



<small>

Date : {tache.date}

</small>


</div>





<div className="task-status">


<span>

{tache.statut}

</span>



{

tache.statut !== "Terminée" && (


<button

onClick={()=>terminerTache(index)}

>


<FaCheckCircle/>

Terminer


</button>


)

}



</div>


</div>


))


}



</div>



</div>

);


}


export default Taches;