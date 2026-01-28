import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";
import { useNavigate, useLocation } from "react-router-dom";
import { SetStartingTeamValues } from "../../utils/SetStartingTeamValues.js";
import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";

import "./FirstTeamPage.css";
import "../../utils/Pitch.css";
import "../../themes/clubThemes.css";
import { getApiBase } from "../../config/api.js";

function FirstTeamPage() {
  const { setCurrentTeam, currentTeam } = useCurrentTeam();
  const { clubData } = useClub();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const displayTeam = location.state?.freshTeam || currentTeam || [];
  const userClub = user?.club;
  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";
  const { def, mid, fwd } = SetStartingTeamValues(clubData);

  const [selectedGk, setSelectedGk] = useState(null);
  const [selectedDef, setSelectedDef] = useState([]);
  const [selectedMid, setSelectedMid] = useState([]);
  const [selectedFwd, setSelectedFwd] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState([]);

  const [activeStarterId, setActiveStarterId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);

  // makes use of either the team passed from the last page or the context
  // most of the time the location state as context is a bit iffy
  useEffect(() => {
    if (displayTeam && displayTeam.length > 0) {
      if (!currentTeam || currentTeam.length === 0) {
        setCurrentTeam(displayTeam);
      }

      const allGk = displayTeam.filter((p) => p.position === "GK");
      const allDef = displayTeam.filter((p) => p.position === "DEF");
      const allMid = displayTeam.filter((p) => p.position === "MID");
      const allFwd = displayTeam.filter((p) => p.position === "FWD");

      const starters = [
        allGk[0],
        ...allDef.slice(0, def),
        ...allMid.slice(0, mid),
        ...allFwd.slice(0, fwd),
      ].filter(Boolean);

      setSelectedGk(allGk[0] ?? null);
      setSelectedDef(allDef.slice(0, def));
      setSelectedMid(allMid.slice(0, mid));
      setSelectedFwd(allFwd.slice(0, fwd));

      const starterIds = starters.map((s) => s.id);
      const subs = displayTeam.filter(
        (player) => !starterIds.includes(player.id),
      );
      setSelectedSubs(subs);
    }
  }, [displayTeam, def, mid, fwd, setCurrentTeam]);

  if (!displayTeam || displayTeam.length === 0) {
    return (
      <div className={themeClass}>
        <NavBar />
        <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
          <h2>Loading your squad...</h2>
        </div>
      </div>
    );
  }

  const handleStarterClick = (player) => {
    if (activeStarterId === player.id) {
      setActiveStarterId(null);
      return;
    }
    if (activeSubId) {
      const subPlayer = selectedSubs.find((p) => p.id === activeSubId);
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
        selectedGk,
        ...selectedDef,
        ...selectedMid,
        ...selectedFwd,
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
      setSelectedGk(sub);
    } else {
      if (starter.position === "DEF")
        setSelectedDef((prev) => prev.filter((p) => p.id !== starter.id));
      if (starter.position === "MID")
        setSelectedMid((prev) => prev.filter((p) => p.id !== starter.id));
      if (starter.position === "FWD")
        setSelectedFwd((prev) => prev.filter((p) => p.id !== starter.id));

      if (sub.position === "DEF") setSelectedDef((prev) => [...prev, sub]);
      if (sub.position === "MID") setSelectedMid((prev) => [...prev, sub]);
      if (sub.position === "FWD") setSelectedFwd((prev) => [...prev, sub]);
    }
    setSelectedSubs((prev) => [
      ...prev.filter((p) => p.id !== sub.id),
      starter,
    ]);
    setActiveStarterId(null);
    setActiveSubId(null);
  };

  const saveSquad = async (fullSquad) => {
    setCurrentTeam(fullSquad);
    // console.log("Full details squad...", currentTeam);
    // right now need to save the team to database
    // need to decide what we store either just id and starting or full details
    // i think just id and starting and then we keep the currentTeam locally
    const saveSquad = fullSquad.map((player) => ({
      id: player.id,
      isStarting: player.isStarting,
    }));

    // console.log(user.budget);

    console.log("database squad ...", saveSquad);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${getApiBase()}/api/team/saveTeam`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          teamName: user.teamName,
          gw: user.currentGW,
          team: saveSquad,
          budget: user.budget,
        }),
      });

      const data = await res.json();

      if (data.success === true) {
        //   navigate to create team page
        navigate("/HomePage"); }
     } catch (error) {
      console.error("Error saving team :", error);
    }
  };

  return (
    <div className={themeClass}>
      <NavBar />
      <div className="topRow">
        <div className="teamName">
          <h4>{user.teamName}</h4>
        </div>
        <div className="gameweek">
          <h4>Gameweek: {user.currentGW}</h4>
        </div>
      </div>

      <div className="selectedTeamContainer">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          <div className="shirtRow">
            {selectedGk && (
              <PlayerIcon
                player={selectedGk}
                isActive={activeStarterId === selectedGk.id}
                onClick={handleStarterClick}
                isGk={true}
                type="starter"
                themeClass={themeClass}
              />
            )}
          </div>
        </div>

        <div className="defRow">
          <div className="shirtRow">
            {selectedDef.map((p) => (
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
            {selectedMid.map((p) => (
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
            {selectedFwd.map((p) => (
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

      <div className="subRow">
        <div className="shirtRow">
          {selectedSubs.map((p) => (
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

      <button
        className="saveFirstTeamButton"
        onClick={() => {
          const fullSquad = [
            selectedGk,
            ...selectedDef,
            ...selectedMid,
            ...selectedFwd,
          ]
            .map((p) => ({ ...p, isStarting: true }))
            .concat(selectedSubs.map((p) => ({ ...p, isStarting: false })));
          saveSquad(fullSquad);
        }}
      >
        Save Starting Team
      </button>
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

export default FirstTeamPage;
