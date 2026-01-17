import React from "react";
import { useState, useEffect } from "react";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { usePlayer } from "../../context/PlayerContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

import { auth } from "../../config/firebase.js";

import { getApiBase } from "../../config/api.js";

import { Navigate, useNavigate } from "react-router-dom";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import AddGKModal from "./AddGKModal.js";
import AddDEFModal from "./AddDEFModal.js";
import AddMIDModal from "./AddMIDModal.js";
import AddFWDModal from "./AddFWDModal.js";

import "./CreateTeamPage.css";
import "../../themes/clubThemes.css";

function CreateTeamPage() {
  const { setUser, user } = useUser();
  const { players } = usePlayer();
  const { setClubData, clubData } = useClub();
  const { setCurrentTeam, currentTeam } = useCurrentTeam();

  const [budget, setBudget] = useState(0);
  const navigate = useNavigate();

  const userClub = user?.club;
  const [teamName, setTeamName] = useState("");
  const [teamNameInput, setTeamNameInput] = useState("");

  const allGk = players.filter((p) => p.position === "GK");
  const allDef = players.filter((p) => p.position === "DEF");
  const allMid = players.filter((p) => p.position === "MID");
  const allFwd = players.filter((p) => p.position === "FWD");

  const [showGkModal, setShowGkModal] = useState(false);
  const [showDefModal, setShowDefModal] = useState(false);
  const [showMidModal, setShowMidModal] = useState(false);
  const [showFwdModal, setShowFwdModal] = useState(false);

  const [teamSaved, setTeamSaved] = useState([]);

    useEffect(() => {
    if (!user) return;

    const fetchClubData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${getApiBase()}/api/team/getClubData?club=${userClub}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        // console.log(data);
        setClubData(data);
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchClubData();
  }, []);

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const gkOptions = (allGk || []).map((g) => ({
    ...g,
    // value: g.cost, removed as dont think does anythign
    label: `${g.name} - (${g.team})`,
  }));

  const defOptions = (allDef || []).map((d) => ({
    ...d,
    label: `${d.name} - (${d.team})`,
  }));

  const midOptions = (allMid || []).map((m) => ({
    ...m,
    label: `${m.name} - (${m.team})`,
  }));

  const fwdOptions = (allFwd || []).map((f) => ({
    ...f,
    label: `${f.name} - (${f.team})`,
  }));

  useEffect(() => {
    setBudget(clubData?.budget || 0);
  }, [clubData]);

  // creates "slots" for each position with as many numbers as our club data says
  // click first gk shirt - fills up slot one

  const [selectedGK, setSelectedGK] = useState(
    Array(clubData.numbGk).fill(null)
  );
  const [activeGKIndex, setActiveGKIndex] = useState(null);

  const [selectedDEF, setSelectedDEF] = useState(
    Array(clubData.numbDef).fill(null)
  );
  const [activeDEFIndex, setActiveDEFIndex] = useState(null);

  const [selectedMID, setSelectedMID] = useState(
    Array(clubData.numbMid).fill(null)
  );
  const [activeMIDIndex, setActiveMIDIndex] = useState(null);

  const [selectedFWD, setSelectedFWD] = useState(
    Array(clubData.numbFwd).fill(null)
  );
  const [activeFWDIndex, setActiveFWDIndex] = useState(null);

  // way tod display how many players from each squad have been selected (??)
  // save and check buttons

  // need to save teamName at a seperate time so uin firstTeam
  const saveTeam = async (team) => {
    alert("Team saved successfully!");
    setUser({ ...user, teamName: teamName });
    setCurrentTeam(team);

    if (team.length > 0) {
      navigate("/FirstTeam", {state: {freshTeam: team}});

    } 
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="CreateTeamTopRow">
        <div className="teamName">
          <input
            type="text"
            placeholder="Enter Team Name"
            value={teamNameInput}
            onChange={(e) => setTeamNameInput(e.target.value)}
          />
          <button onClick={() => setTeamName(teamNameInput)}>Save Name</button>
        </div>

        <h4 className={`budget ${budget < 0 ? "negative" : ""}`}>
          Budget : £{budget.toFixed(2)}m
        </h4>
      </div>

      {teamName && (
        <div className="selectedTeamContainer">
          <div className="penalty-box top"></div>
          <div className="six-yard-box top"></div>
          <div className="penalty-arc top"></div>
          <div className="halfway-line"></div>
          {/* <div className="center-circle"></div> */}

          <div className="gkRow">
            <h4>Goalkeepers</h4>
            <div className="shirtRow">
              {Array.from({ length: clubData.numbGk }).map((_, index) => (
                <div key={index} className="shirtContainer">
                  <button
                    className="shirtButton"
                    onClick={() => {
                      const existingPlayer = selectedGK[index];

                      if (existingPlayer) {
                        setBudget((prev) => prev + existingPlayer.cost);
                      }
                      setShowGkModal(true);
                      setActiveGKIndex(index);
                    }}
                  >
                    <ShirtSvg className={`gkShirt ${themeClass}`} size={80} />
                  </button>
                  <div className="namePricePoints">
                    {selectedGK[index] && (
                      <>
                        <p>{selectedGK[index].name}</p>
                        <p>£{selectedGK[index].cost}m</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="defRow">
            <h4>Defenders</h4>
            <div className="shirtRow">
              {Array.from({ length: clubData.numbDef }).map((_, index) => (
                <div key={index} className="shirtContainer">
                  <button
                    className="shirtButton"
                    onClick={() => {
                      const existingPlayer = selectedDEF[index];

                      if (existingPlayer) {
                        setBudget((prev) => prev + existingPlayer.cost);
                      }
                      setShowDefModal(true);
                      setActiveDEFIndex(index);
                    }}
                  >
                    <ShirtSvg className={`shirt ${themeClass}`} size={80} />
                  </button>
                  <div className="namePricePoints">
                    {selectedDEF[index] && (
                      <>
                        <p>{selectedDEF[index].name}</p>
                        <p>£{selectedDEF[index].cost}m</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="midRow">
            <h4>Midfielders</h4>
            <div className="shirtRow">
              {Array.from({ length: clubData.numbMid }).map((_, index) => (
                <div key={index} className="shirtContainer">
                  <button
                    className="shirtButton"
                    onClick={() => {
                      const existingPlayer = selectedMID[index];

                      if (existingPlayer) {
                        setBudget((prev) => prev + existingPlayer.cost);
                      }
                      setShowMidModal(true);
                      setActiveMIDIndex(index);
                    }}
                  >
                    <ShirtSvg className={`shirt ${themeClass}`} size={75} />
                  </button>
                  <div className="namePricePoints">
                    {selectedMID[index] && (
                      <>
                        <p>{selectedMID[index].name}</p>
                        <p>£{selectedMID[index].cost}m</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fwdRow">
            <h4>Forwards</h4>
            <div className="shirtRow">
              {Array.from({ length: clubData.numbFwd }).map((_, index) => (
                <div key={index} className="shirtContainer">
                  <button
                    className="shirtButton"
                    onClick={() => {
                      const existingPlayer = selectedFWD[index];

                      if (existingPlayer) {
                        setBudget((prev) => prev + existingPlayer.cost);
                      }
                      setShowFwdModal(true);
                      setActiveFWDIndex(index);
                    }}
                  >
                    <ShirtSvg className={`shirt ${themeClass}`} size={75} />
                  </button>
                  <div className="namePricePoints">
                    {selectedFWD[index] && (
                      <>
                        <p>{selectedFWD[index].name}</p>
                        <p>£{selectedFWD[index].cost}m</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {teamName && (
        <button
          className="saveTeamButton"
          disabled={
            false
            // selectedGK.includes(null) ||
            // selectedDEF.includes(null) ||
            // selectedMID.includes(null) ||
            // selectedFWD.includes(null) ||
            // budget < 0
          }
          onClick={() => {
            // save team function
            const team = [
              ...selectedGK,
              ...selectedDEF,
              ...selectedMID,
              ...selectedFWD,
            ];
            setTeamSaved(team);
            setBudget(clubData.budget);

            saveTeam(team);
          }}
        >
          Save Team
        </button>
      )}

      {/* GK modal */}
      <AddGKModal
        show={showGkModal}
        onClose={() => setShowGkModal(false)}
        gkOptions={gkOptions}
        budget={budget}
        setBudget={setBudget}
        setSelectedGK={setSelectedGK}
        selectedGK={selectedGK || []}
        activeGKIndex={activeGKIndex}
      />

      {/* DEF modal */}
      <AddDEFModal
        show={showDefModal}
        onClose={() => setShowDefModal(false)}
        defOptions={defOptions}
        budget={budget}
        setBudget={setBudget}
        setSelectedDEF={setSelectedDEF}
        selectedDEF={selectedDEF || []}
        activeDEFIndex={activeDEFIndex}
      />

      {/* MID modal */}
      <AddMIDModal
        show={showMidModal}
        onClose={() => setShowMidModal(false)}
        midOptions={midOptions}
        budget={budget}
        setBudget={setBudget}
        setSelectedMID={setSelectedMID}
        selectedMID={selectedMID || []}
        activeMIDIndex={activeMIDIndex}
      />

      {/* FWD modal */}
      <AddFWDModal
        show={showFwdModal}
        onClose={() => setShowFwdModal(false)}
        fwdOptions={fwdOptions}
        budget={budget}
        setBudget={setBudget}
        setSelectedFWD={setSelectedFWD}
        selectedFWD={selectedFWD || []}
        activeFWDIndex={activeFWDIndex}
      />
    </div>
  );
}

export default CreateTeamPage;