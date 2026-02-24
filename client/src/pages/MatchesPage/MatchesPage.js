import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useAllTeam } from "../../context/AllTeamsContext.js";

import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";
import "../../themes/clubThemes.css";

function MatchesPage() {
  const { user } = useUser();

  const [changeGwFixtures, setChangeGwFixtures] = useState(
    `gw${user?.currentGW}`,
  );

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const nextGwFixtures = () => {
    const number = parseInt(changeGwFixtures.slice(2), 10);
    if (changeGwFixtures === currentGW) {
      return;
    }
    setChangeGwFixtures("gw" + (number + 1));
    // const next = "gw" + (number + 1);
    // updateTeam(next);
  };

  const prevGwFixtures = () => {
    const number = parseInt(changeGwFixtures.slice(2), 10);
    if (number === 1) {
      setChangeGwFixtures("gw1");
      return;
    }
    setChangeGwFixtures("gw" + (number - 1));
    // const prev = "gw" + (number - 1);
    // updateTeam(prev);
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRow2">
        <button onClick={prevGwFixtures}>&larr;</button>

        <h4>{changeGwFixtures.toLocaleUpperCase()}</h4>

        <button onClick={nextGwFixtures}>&rarr;</button>
      </div>

      {/* 
      NOW we display the fixtures corresponding to the gw */}
    </div>
  );
}

export default MatchesPage;
