import { useEffect, useState } from "react";
import React from "react";
import "./TeamModal.css";
import "../../themes/clubThemes.css";

const TeamModal = ({ squad, fixtureDetails, fixtureGw, onClose }) => {
  console.log(fixtureDetails);
  console.log(fixtureGw);
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button onClick={onClose}>Close</button>

        <h2>Team for Squad {squad}</h2>
      </div>
    </div>
  );
};

export default TeamModal;
