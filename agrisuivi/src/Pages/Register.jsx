import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTransitionNavigate } from "../context/TransitionContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaBuilding,
  FaLeaf,
  FaArrowRight,
  FaIdCard,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import "./Register.css";


function Register() {

  const navigate = useTransitionNavigate();
  const { registerTenant } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    exploitation: "",
    schema_name: "",
    proprietaire: "",
    email: "",
    telephone: "",
    password: "",
    confirmation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-générer le schema_name depuis le nom d'exploitation (slug)
    if (name === "exploitation") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({
        ...prev,
        exploitation: value,
        schema_name: slug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!formData.schema_name) {
      toast.error("L'identifiant de l'exploitation est requis.");
      return;
    }

    setLoading(true);

    try {
      await registerTenant({
        farm_name: formData.exploitation,
        schema_name: formData.schema_name,
        owner_name: formData.proprietaire,
        email: formData.email,
        password: formData.password,
        phone: formData.telephone,
      });

      toast.success(
        "Exploitation créée avec succès ! Connectez-vous maintenant.",
        { duration: 5000 }
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };



  return (


    <div className="register-page">


      {/* ======================
            PARTIE GAUCHE
      ======================= */}


      <motion.div

        className="register-left"

        initial={{opacity:0,x:-50}}

        animate={{opacity:1,x:0}}

        transition={{duration:.8}}

      >


        <div className="register-overlay">


          <div className="logo-box">


            <div className="logo-circle">

              <FaLeaf />

            </div>


            <h1>
              AgriSuivi
            </h1>


          </div>




          <h2>

            Créez votre espace
            d'exploitation intelligent

          </h2>




          <p>

            Centralisez la gestion de votre exploitation,
            suivez vos employés, vos stocks et vos activités
            depuis une seule plateforme.

          </p>




          <div className="feature-card">


            <FaBuilding />


            <div>

              <h4>
                Gestion complète
              </h4>


              <span>
                Gérez vos exploitations facilement.
              </span>

            </div>


          </div>





          <div className="feature-card">


            <FaUser />


            <div>

              <h4>
                Gestion des employés
              </h4>


              <span>
                Contrôlez les accès et activités.
              </span>


            </div>


          </div>





          <div className="feature-card">


            <FaLeaf />


            <div>

              <h4>
                Traçabilité agricole
              </h4>


              <span>
                Gardez l'historique de vos opérations.
              </span>


            </div>


          </div>



        </div>


      </motion.div>






      {/* ======================
            FORMULAIRE
      ======================= */}



      <motion.div

        className="register-right"

        initial={{opacity:0,x:50}}

        animate={{opacity:1,x:0}}

        transition={{duration:.8}}

      >




        <div className="register-card">



          <span className="badge">

            Nouvelle exploitation

          </span>




          <h2>

            Créer un compte

          </h2>




          <p className="subtitle">

            Commencez à gérer votre exploitation
            avec AgriSuivi.

          </p>





          <form onSubmit={handleSubmit}>



            <div className="input-group">

              <FaBuilding />

              <input

                type="text"

                name="exploitation"

                placeholder="Nom de l'exploitation"

                value={formData.exploitation}

                onChange={handleChange}

                required

              />

            </div>

            {/* Identifiant unique auto-généré et modifiable */}
            <div className="input-group">

              <FaIdCard />

              <input

                type="text"

                name="schema_name"

                placeholder="Identifiant unique (ex: ferme_dupont)"

                value={formData.schema_name}

                onChange={handleChange}

                required

              />

            </div>
            {formData.schema_name && (
              <p style={{ fontSize: "0.78rem", color: "#16a34a", marginTop: "-12px", marginBottom: "10px", paddingLeft: "4px" }}>
                Identifiant de connexion : <strong>{formData.schema_name}</strong>
              </p>
            )}






            <div className="input-group">

              <FaUser />

              <input

                type="text"

                name="proprietaire"

                placeholder="Nom du propriétaire"

                value={formData.proprietaire}

                onChange={handleChange}

                required

              />

            </div>






            <div className="input-group">

              <FaEnvelope />

              <input

                type="email"

                name="email"

                placeholder="Adresse email"

                value={formData.email}

                onChange={handleChange}

                required

              />

            </div>






            <div className="input-group">

              <FaPhone />

              <input

                type="text"

                name="telephone"

                placeholder="Téléphone"

                value={formData.telephone}

                onChange={handleChange}

              />

            </div>







            <div className="input-group">


              <FaLock />


              <input

                type={showPassword ? "text":"password"}

                name="password"

                placeholder="Mot de passe"

                value={formData.password}

                onChange={handleChange}

                required

              />



              <button

                type="button"

                className="show-password"

                onClick={()=>setShowPassword(!showPassword)}

              >

                {

                showPassword ?

                <FaEyeSlash/>

                :

                <FaEye/>

                }

              </button>


            </div>







            <div className="input-group">


              <FaLock />


              <input

                type={showConfirm ? "text":"password"}

                name="confirmation"

                placeholder="Confirmer le mot de passe"

                value={formData.confirmation}

                onChange={handleChange}

                required

              />



              <button

                type="button"

                className="show-password"

                onClick={()=>setShowConfirm(!showConfirm)}

              >

                {

                showConfirm ?

                <FaEyeSlash/>

                :

                <FaEye/>

                }

              </button>


            </div>







            <button

              className="register-btn"

              type="submit"

              disabled={loading}

            >

              {loading ? "Création en cours..." : (
                <>
                  Créer mon espace
                  <FaArrowRight />
                </>
              )}

            </button>






          </form>







          <p className="login-link">

            Vous avez déjà un compte ?

            <Link to="/login">

              Se connecter

            </Link>


          </p>




        </div>



      </motion.div>





    </div>


  );

}


export default Register;