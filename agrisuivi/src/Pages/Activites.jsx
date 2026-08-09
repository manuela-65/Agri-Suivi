import React, { useState } from "react";

import {
  FaPlus,
  FaClipboardList,
  FaTrash
} from "react-icons/fa";

import "../Styles/Activites.css";


function Activites(){


const user = JSON.parse(
  localStorage.getItem("currentUser")
);



const [modal,setModal] = useState(false);



const [form,setForm] = useState({

titre:"",
description:"",
date:""

});





const [activites,setActivites] = useState(()=>{

const data = localStorage.getItem("activites");

return data ? JSON.parse(data) : [];

});





const handleChange=(e)=>{

setForm({

...form,

[e.target.name]:e.target.value

});

};





const enregistrer=(e)=>{

e.preventDefault();


const nouvelleActivite={

id:Date.now(),

...form,

utilisateur:user?.nom || "Inconnu",

email:user?.email || "",

exploitation:user?.exploitation || "",

statut:"Terminée"

};



const liste=[

...activites,

nouvelleActivite

];



setActivites(liste);


localStorage.setItem(

"activites",

JSON.stringify(liste)

);



setForm({

titre:"",

description:"",

date:""

});


setModal(false);


};







const supprimer=(index)=>{


const liste=activites.filter(

(_,i)=>i!==index

);



setActivites(liste);



localStorage.setItem(

"activites",

JSON.stringify(liste)

);


};







return (

<div className="activites-page">


<div className="page-header">


<div>

<h1>
Mes activités
</h1>


<p>
Enregistrez les actions réalisées dans l'exploitation
</p>


</div>



<button onClick={()=>setModal(true)}>

<FaPlus/>

Ajouter une activité

</button>


</div>






<div className="activites-container">



{

activites.length===0 ?


<div className="empty">

<FaClipboardList/>

<h3>
Aucune activité enregistrée
</h3>

</div>



:


activites.map((act,index)=>(


<div className="activite-card" key={index}>


<div>

<h3>
{act.titre}
</h3>


<p>
{act.description}
</p>


<small>
Date : {act.date}
</small>


<p>
Réalisé par : {act.utilisateur}
</p>


</div>



<button

onClick={()=>supprimer(index)}

>

<FaTrash/>

</button>


</div>


))


}



</div>







{

modal &&


<div className="modal">


<div className="modal-box">


<h2>
Nouvelle activité
</h2>



<form onSubmit={enregistrer}>


<input

name="titre"

placeholder="Titre de l'activité"

value={form.titre}

onChange={handleChange}

/>



<textarea

name="description"

placeholder="Description"

value={form.description}

onChange={handleChange}

/>



<input
type="date"
name="date"
value={form.date}
onChange={handleChange}
max={new Date().toISOString().split("T")[0]}
/>



<button>

Enregistrer

</button>



</form>



</div>


</div>


}





</div>

);


}


export default Activites;