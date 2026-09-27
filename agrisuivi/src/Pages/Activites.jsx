import React, { useState, useEffect, useRef } from "react";

import {
  FaPlus,
  FaClipboardList,
  FaTrash
} from "react-icons/fa";

import toast from "react-hot-toast";

import { CultureService } from "../api/apiClient";

import "../Styles/Activites.css";


function Activites(){


const user = JSON.parse(
  localStorage.getItem("currentUser")
);



const [modal,setModal] = useState(false);

const [loading,setLoading] = useState(true);

const [saving,setSaving] = useState(false);



const [form,setForm] = useState({

titre:"",
description:"",
date:""

});

const videoInputRef = useRef(null);
const previewVideoRef = useRef(null);
const [videoProof, setVideoProof] = useState(null);
const [videoPreview, setVideoPreview] = useState("");
const [cameraStream, setCameraStream] = useState(null);
const [cameraRecorder, setCameraRecorder] = useState(null);
const [isRecordingVideo, setIsRecordingVideo] = useState(false);

const [activites,setActivites] = useState([]);



useEffect(()=>{

chargerActivites();

},[]);

const chargerActivites = async () => {

try{

setLoading(true);

const data = await CultureService.getActivites();

setActivites(data || []);

}catch(error){

console.error("Erreur de chargement des activités :", error);

toast.error("Impossible de charger les activités.");

}finally{

setLoading(false);

}

};





const handleChange=(e)=>{

setForm({

...form,

[e.target.name]:e.target.value

});

};

const openVideoCamera = async () => {
  if (isRecordingVideo) {
    if (cameraRecorder && cameraRecorder.state !== 'inactive') {
      cameraRecorder.stop();
    } else if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsRecordingVideo(false);
    }
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast.error('Votre navigateur ne prend pas en charge la caméra. Utilisez le bouton “Choisir une vidéo”.');
    return;
  }

  if (!window.MediaRecorder) {
    toast.error('L’enregistrement vidéo n’est pas supporté ici. Utilisez le bouton “Choisir une vidéo”.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: true,
    });

    setCameraStream(stream);
    setIsRecordingVideo(true);

    const video = previewVideoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
    }

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
      const file = new File([blob], 'preuve-video.webm', { type: blob.type || 'video/webm' });
      setVideoProof(file);
      setVideoPreview(URL.createObjectURL(file));
      stream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraRecorder(null);
      setIsRecordingVideo(false);
    };

    recorder.start();
    setCameraRecorder(recorder);
  } catch (error) {
    console.error('Accès caméra refusé :', error);
    toast.error('Accès caméra refusé. Utilisez le bouton “Choisir une vidéo”.');
  }
};

const handleVideoProofChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setVideoProof(file);
  setVideoPreview(URL.createObjectURL(file));
};

const enregistrer=async(e)=>{

e.preventDefault();

if(!form.titre || !form.date){

toast.error("Le titre et la date sont obligatoires.");

return;

}

try{

setSaving(true);

const payload = new FormData();
payload.append("type_activite", form.titre);
payload.append("date_activite", form.date);
payload.append("description", form.description || "");

if (videoProof) {
  payload.append("preuve_video", videoProof);
}

await CultureService.createActivite(payload);

toast.success("Activité enregistrée avec succès.");

setForm({

titre:"",

description:"",

date:""

});
setVideoProof(null);
setVideoPreview("");
if (videoInputRef.current) {
  videoInputRef.current.value = "";
}

setModal(false);

await chargerActivites();

}catch(error){

console.error("Erreur lors de l'enregistrement :", error);

toast.error(error.message || "Erreur lors de l'enregistrement de l'activité.");

}finally{

setSaving(false);

}

};








const supprimer=async(id)=>{

if(!window.confirm("Supprimer cette activité ?")) return;

try{

await CultureService.deleteActivite(id);

toast.success("Activité supprimée.");

setActivites(prev => prev.filter(a => a.id !== id));

}catch(error){

console.error("Erreur lors de la suppression :", error);

toast.error("Erreur lors de la suppression de l'activité.");

}

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

loading ?

<div className="empty">
<FaClipboardList/>
<h3>
Chargement des activités...
</h3>
</div>

:

activites.length===0 ?

<div className="empty">

<FaClipboardList/>

<h3>
Aucune activité enregistrée
</h3>

</div>



:


activites.map((act)=>(


<div className="activite-card" key={act.id}>


<div>

<h3>
{act.type_activite}
</h3>


<p>
{act.description}
</p>


<small>
Date : {act.date_activite}
</small>


<p>
Réalisé par : {act.employe_nom || (user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Non assigné")}
</p>


</div>



<button

onClick={()=>supprimer(act.id)}

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

<div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
  <button type="button" onClick={openVideoCamera}>
    {isRecordingVideo ? "🛑 Arrêter l'enregistrement" : "🎥 Ouvrir la caméra"}
  </button>

  <button type="button" onClick={() => videoInputRef.current?.click()}>
    📁 Choisir une vidéo
  </button>

  <input
    ref={videoInputRef}
    type="file"
    accept="video/*"
    hidden
    onChange={handleVideoProofChange}
  />

  {videoPreview ? (
    <video
      src={videoPreview}
      controls
      style={{ width: "100%", maxHeight: "220px", borderRadius: "10px" }}
    />
  ) : (
    <video
      ref={previewVideoRef}
      autoPlay
      muted
      playsInline
      style={{ width: "100%", maxHeight: "220px", borderRadius: "10px", display: isRecordingVideo ? 'block' : 'none' }}
    />
  )}
</div>


<button disabled={saving}>

{saving ? "Enregistrement..." : "Enregistrer"}

</button>



</form>



</div>


</div>


}




</div>

);


}


export default Activites;