import { useEffect, useState } from "react";
import React from "react";

import { useUser } from "../../context/UserContext.js";

import "./TeamModal.css";
import "../../themes/clubThemes.css";
import "../../utils/Pitch.css";

const TeamModal = ({ squad, fixtureDetails, fixtureGw, game, onClose }) => {
  const { user } = useUser();
  const userClub = user?.club;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  console.log(fixtureDetails);
  console.log(fixtureGw);
  console.log(game);

  return (
    <div className="modalOverlayTeam" onClick={onClose}>
      <div className={`modalContainerTeam ${themeClass}`}>
        <div className="modalTeamHeader">
          <button onClick={onClose}>X</button>
          <h4>
            {game.homeTeam} ({game.homeSquad}s){" "}
            <b>
              {game.homeScore} - {game.awayScore}
            </b>{" "}
            {game.awayTeam} ({game.awaySquad}
            s)
          </h4>{" "}
        </div>
        <div className="modalTeamBody">
          <div className="selectedTeamContainer HomePage">
            <div className="penalty-box top"></div>
            <div className="six-yard-box top"></div>
            <div className="penalty-arc top"></div>
            <div className="halfway-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
