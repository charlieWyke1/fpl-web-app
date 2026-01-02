import React from "react";
import { useState, useEffect } from "react";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { usePlayer } from "../../context/PlayerContext.js";

import { auth } from "../../config/firebase.js";
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
  const { clubData, setClubData } = useClub();
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

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // console.log(user);
  // this will only ever run once
  useEffect(() => {
    if (!user) return;

    const fetchClubData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `http://localhost:5000/api/team/getClubData?club=${user.club}`,
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

  const gkOptions = (allGk || []).map((g) => ({
    ...g,
    value: g.id,
    label: `${g.name} - (${g.team})`,
  }));

  const defOptions = (allDef || []).map((d) => ({
    ...d,
    value: d.id,
    label: `${d.name} - (${d.team})`,
  }));

  const midOptions = (allMid || []).map((m) => ({
    ...m,
    value: m.id,
    label: `${m.name} - (${m.team})`,
  }));

  const fwdOptions = (allFwd || []).map((f) => ({
    ...f,
    value: f.id,
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

  const saveTeam = async (team) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/team/saveTeam", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          teamName: teamName, // save this to the user not team
          players: team,
          gw: user.currentGW,
          budget: budget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Team saved successfully!");
        setUser({ ...user, teamName: teamName });
        navigate("/team");
        // CURRENT ERROR WHEN CREATE TEAM THEN WONT LOAD TEAM STRAIGHT IN
        // BUT WORKS FINE FOR SAVING TEAM GOING HOMEPAGE THEN GOING BACK TO TEAM
      } else {
        alert("Error saving team.");
      }
    } catch (error) {
      console.error("Error saving team:", error);
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

            // now reset options
            setSelectedGK(Array(clubData.numbGk).fill(null));
            setSelectedDEF(Array(clubData.numbDef).fill(null));
            setSelectedMID(Array(clubData.numbMid).fill(null));
            setSelectedFWD(Array(clubData.numbFwd).fill(null));
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
