import React from "react";
import "../Styles/StatCard.css";


function StatCard({ icon, title, value, description }) {

  return (

    <div className="stat-card">


      <div className="stat-icon">
        {icon}
      </div>


      <div className="stat-content">

        <h4>{title}</h4>

        <h2>{value}</h2>

        <p>{description}</p>

      </div>


    </div>

  );
}


export default StatCard;