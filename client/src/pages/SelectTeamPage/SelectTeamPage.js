import React from "react";
import { useState, useEffect, useMemo } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

import { useNavigate, useLocation } from "react-router-dom";

import { useFixtures } from "../../hooks/useFixtures.js";

import { getApiBase } from "../../config/api.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import Countdown from "../../utils/Countdown.js";

import "../../utils/Pitch.css";
import "./SelectTeamPage.css";
import "../../themes/clubThemes.css";

// NEED TO CHECK IF OUR USER IS AN ADMIN HERE
// AS IF they're not an admin they will have none of the context data
// need to check and give them
// - fixtures, allUsers, all players, current user ...

// also if player has akready got their team set up
// we need to load in all the data as well

function SelectTeamPage() {
  const { user } = useUser();
  const { state } = useLocation();
  //   const { currentTeam, setCurrentTeam } = useCurrentTeam();
  //   const { players, loadingPlayers, refetchPlayers } = usePlayers(user);

  const navigate = useNavigate();
  const freshTeam = state?.team;

  const [startingGk, setStartingGk] = useState([]);
  const [startingDef, setStartingDef] = useState([]);
  const [startingMid, setStartingMid] = useState([]);
  const [startingFwd, setStartingFwd] = useState([]);
  const [startingSub, setStartingSub] = useState([]);

  const [activeStarterId, setActiveStarterId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const fixturesTemp = useFixtures(user);
  const tsDate = fixturesTemp.fixtures.cutOff[currentGW];
  const cutOffDate = new Date(tsDate._seconds * 1000);

  useEffect(() => {
    if (freshTeam && freshTeam.length > 0) {
      setStartingGk(
        freshTeam.filter((p) => p.position === "GK" && p.isStarting === true),
      );
      setStartingDef(
        freshTeam.filter((p) => p.position === "DEF" && p.isStarting === true),
      );
      setStartingMid(
        freshTeam.filter((p) => p.position === "MID" && p.isStarting === true),
      );
      setStartingFwd(
        freshTeam.filter((p) => p.position === "FWD" && p.isStarting === true),
      );

      setStartingSub(freshTeam.filter((p) => p.isStarting === false));
    }
  }, [freshTeam]);

  const handleStarterClick = (player) => {
    if (activeStarterId === player.id) {
      setActiveStarterId(null);
      return;
    }
    if (activeSubId) {
      const subPlayer = startingSub.find((p) => p.id === activeSubId);
      if (
        (player.position === "GK" && subPlayer.position !== "GK") ||
        (player.position !== "GK" && subPlayer.position === "GK")
      )
        return;
      swapPlayers(player, subPlayer);
      return;
    }
    setActiveStarterId(player.id);
  };

  const handleSubClick = (player) => {
    if (activeSubId === player.id) {
      setActiveSubId(null);
      return;
    }
    if (activeStarterId) {
      const starterPlayer = [
        startingGk,
        ...startingDef,
        ...startingMid,
        ...startingFwd,
      ].find((p) => p?.id === activeStarterId);
      if (!starterPlayer) return;
      if (
        (player.position === "GK" && starterPlayer.position !== "GK") ||
        (player.position !== "GK" && starterPlayer.position === "GK")
      )
        return;
      swapPlayers(starterPlayer, player);
      return;
    }
    setActiveSubId(player.id);
  };

  const swapPlayers = (starter, sub) => {
    if (starter.position === "GK") {
      setStartingGk(sub);
    } else {
      if (starter.position === "DEF")
        setStartingDef((prev) => prev.filter((p) => p.id !== starter.id));
      if (starter.position === "MID")
        setStartingMid((prev) => prev.filter((p) => p.id !== starter.id));
      if (starter.position === "FWD")
        setStartingFwd((prev) => prev.filter((p) => p.id !== starter.id));

      if (sub.position === "DEF") setStartingDef((prev) => [...prev, sub]);
      if (sub.position === "MID") setStartingMid((prev) => [...prev, sub]);
      if (sub.position === "FWD") setStartingFwd((prev) => [...prev, sub]);
    }
    setStartingSub((prev) => [...prev.filter((p) => p.id !== sub.id), starter]);
    setActiveStarterId(null);
    setActiveSubId(null);
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRowSelect">
        <h4>{user?.teamName}</h4>
        <h4>Select Team for {currentGW.toLocaleUpperCase()}</h4>
      </div>

      <Countdown targetDate={cutOffDate} />

      <div className="selectedTeamContainer HomePage">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          <div className="shirtRow">
            {startingGk.map((p) => (
              <PlayerIcon
                key={p.id}
                player={p}
                isActive={activeStarterId === p.id}
                onClick={handleStarterClick}
                isGk={true}
                type="starter"
                themeClass={themeClass}
              />
            ))}
          </div>
        </div>

        <div className="defRow">
          <div className="shirtRow">
            {startingDef.map((p) => (
              <PlayerIcon
                key={p.id}
                player={p}
                isActive={activeStarterId === p.id}
                onClick={handleStarterClick}
                type="starter"
                themeClass={themeClass}
              />
            ))}
          </div>
        </div>

        <div className="midRow">
          <div className="shirtRow">
            {startingMid.map((p) => (
              <PlayerIcon
                key={p.id}
                player={p}
                isActive={activeStarterId === p.id}
                onClick={handleStarterClick}
                type="starter"
                themeClass={themeClass}
              />
            ))}
          </div>
        </div>

        <div className="fwdRow">
          <div className="shirtRow">
            {startingFwd.map((p) => (
              <PlayerIcon
                key={p.id}
                player={p}
                isActive={activeStarterId === p.id}
                onClick={handleStarterClick}
                type="starter"
                themeClass={themeClass}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="subRowSelect">
        <div className="shirtRow">
          {startingSub.map((p) => (
            <PlayerIcon
              key={p.id}
              player={p}
              isActive={activeSubId === p.id}
              onClick={handleSubClick}
              type="sub"
              isGk={p.position === "GK"}
              themeClass={themeClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PlayerIcon = ({ player, isActive, onClick, isGk, type, themeClass }) => {
  let highlightClass = "";

  if (isActive) {
    if (type === "starter") {
      highlightClass = isGk ? "activeGK" : "activeOutfield";
    } else {
      highlightClass = isGk ? "activeSubGK" : "activeSubOutfield";
    }
  }

  return (
    <div className="shirtContainer">
      <button
        className={`shirtButton ${isGk ? "gkButton" : "outfieldButton"} ${highlightClass}`}
        onClick={() => onClick(player)}
      >
        <ShirtSvg
          className={isGk ? `gkShirt ${themeClass}` : `shirt ${themeClass}`}
          size={type === "sub" ? 100 : 120}
        />
      </button>
      <div className={type === "sub" ? "nameTagSub" : "nameTag"}>
        <p>{player?.name}</p>
      </div>
    </div>
  );
};

export default SelectTeamPage;
