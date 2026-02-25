import React from "react";
import { useState, useEffect } from "react";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { usePlayer } from "../../context/PlayerContext.js";

import { useFixtures } from "../../hooks/useFixtures.js";

import { auth } from "../../config/firebase.js";

import { getApiBase } from "../../config/api.js";

import { useNavigate, useLocation } from "react-router-dom";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import Countdown from "../../utils/Countdown.js";

import TransferGkModal from "./TransferGkModal.js";
import TransferDefModal from "./TransferDefModal.js";
import TransferMidModal from "./TransferMidModal.js";
import TransferFwdModal from "./TransferFwdModal.js";

import "../../utils/Pitch.css";
import "../../themes/clubThemes.css";
import "./TransferTeam.css";

function CreateTeamPage() {
  const { user, setUser } = useUser();
  const { state } = useLocation();
  const { players } = usePlayer();
  const { clubData } = useClub();

  const [budget, setBudget] = useState(user?.budget);
  const [transfers, setTransfers] = useState(user?.transfers);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  const navigate = useNavigate();
  const squad = state?.team;
  const originalTeam = state?.team;
  const originalTransfers = user?.transfers;
  const originalBudget = user?.budget;

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const fixturesTemp = useFixtures(user);
  const tsDate = fixturesTemp.fixtures.cutOff[currentGW];
  const cutOffDate = new Date(tsDate._seconds * 1000);

  const allGk = players.filter((p) => p.position === "GK");
  const allDef = players.filter((p) => p.position === "DEF");
  const allMid = players.filter((p) => p.position === "MID");
  const allFwd = players.filter((p) => p.position === "FWD");

  const gkOptions = (allGk || []).map((g) => ({
    ...g,
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

  const [selectedGK, setSelectedGK] = useState(
    Array(clubData.numbGk).fill(null),
  );
  const [activeGKIndex, setActiveGKIndex] = useState(null);

  const [selectedDef, setSelectedDef] = useState(
    Array(clubData.numbDef).fill(null),
  );
  const [activeDefIndex, setActiveDefIndex] = useState(null);

  const [selectedMid, setSelectedMid] = useState(
    Array(clubData.numbMid).fill(null),
  );
  const [activeMidIndex, setActiveMidIndex] = useState(null);

  const [selectedFwd, setSelectedFwd] = useState(
    Array(clubData.numbFwd).fill(null),
  );
  const [activeFwdIndex, setActiveFwdIndex] = useState(null);

  const [showGkTransferModal, setShowGkTransferModal] = useState(false);
  const [showDefTransferModal, setShowDefTransferModal] = useState(false);
  const [showMidTransferModal, setShowMidTransferModal] = useState(false);
  const [showFwdTransferModal, setShowFwdTransferModal] = useState(false);

  const resetTeam = () => {
    setSelectedGK(originalTeam.filter((p) => p.position === "GK"));
    setSelectedDef(originalTeam.filter((p) => p.position === "DEF"));
    setSelectedMid(originalTeam.filter((p) => p.position === "MID"));
    setSelectedFwd(originalTeam.filter((p) => p.position === "FWD"));

    setTransfers(originalTransfers);
    setBudget(originalBudget);
  };

  useEffect(() => {
    if (squad && squad.length > 0) {
      setSelectedGK(squad.filter((p) => p.position === "GK"));
      setSelectedDef(squad.filter((p) => p.position === "DEF"));
      setSelectedMid(squad.filter((p) => p.position === "MID"));
      setSelectedFwd(squad.filter((p) => p.position === "FWD"));
    }
  }, [squad]);

  const team = async () => {
    const newTransferTeam = [
      ...(selectedGK ?? []),
      ...(selectedDef ?? []),
      ...(selectedMid ?? []),
      ...(selectedFwd ?? []),
    ].map(({ id, isStarting }) => ({
      id,
      isStarting,
    }));

    console.log(newTransferTeam);
    console.log(originalTeam);

    // currently rewrite the whole team - cld ugrade to just write the transfer player
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${getApiBase()}/api/team/saveTransferTeam`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          gw: user.currentGW,
          team: newTransferTeam,
          budget: budget,
          numbTransfer: transfers,
        }),
      });

      const data = await res.json();

      if (data.success === true) {
        //   navigate to create team page
        setUser((prev) => ({
          ...prev,
          budget: budget,
          transfers: transfers,
        }));
        navigate("/HomePage");
      }
    } catch (error) {
      console.error("Error saving team :", error);
    }
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRowSelect">
        <h4>{user?.teamName}</h4>
        <h4>Transfers for {currentGW.toLocaleUpperCase()}</h4>
      </div>

      <Countdown targetDate={cutOffDate} onExpired={setDeadlinePassed} />

      <div className="topRowSelect">
        <h4 className={`budget ${budget < 0 ? "negative" : ""}`}>
          Budget: £{budget.toFixed(2)}m
        </h4>
        <h4 className={`transfer ${transfers < 0 ? "negative" : ""}`}>
          Free Transfers: {transfers}
        </h4>
        <button onClick={resetTeam}>
          <h4>Reset Team</h4>
        </button>
      </div>

      <div className="selectedTeamContainer HomePage">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          <div className="shirtRow">
            {Array.from({ length: selectedGK.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button
                  className="shirtButton"
                  onClick={() => {
                    const currentPlayer = selectedGK[index];
                    setBudget((prev) => prev + currentPlayer.cost);
                    setShowGkTransferModal(true);
                    setActiveGKIndex(index);
                  }}
                >
                  <ShirtSvg className={`gkShirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
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
          <div className="shirtRow">
            {Array.from({ length: selectedDef.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button
                  className="shirtButton"
                  onClick={() => {
                    const currentPlayer = selectedDef[index];
                    setBudget((prev) => prev + currentPlayer.cost);
                    setShowDefTransferModal(true);
                    setActiveDefIndex(index);
                  }}
                >
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {selectedDef[index] && (
                    <>
                      <p>{selectedDef[index].name}</p>
                      <p>£{selectedDef[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="midRow">
          <div className="shirtRow">
            {Array.from({ length: selectedMid.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button
                  className="shirtButton"
                  onClick={() => {
                    const currentPlayer = selectedMid[index];
                    setBudget((prev) => prev + currentPlayer.cost);
                    setShowMidTransferModal(true);
                    setActiveMidIndex(index);
                  }}
                >
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {selectedMid[index] && (
                    <>
                      <p>{selectedMid[index].name}</p>
                      <p>£{selectedMid[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fwdRow">
          <div className="shirtRow">
            {Array.from({ length: selectedFwd.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button
                  className="shirtButton"
                  onClick={() => {
                    const currentPlayer = selectedFwd[index];
                    setBudget((prev) => prev + currentPlayer.cost);
                    setShowFwdTransferModal(true);
                    setActiveFwdIndex(index);
                  }}
                >
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {selectedFwd[index] && (
                    <>
                      <p>{selectedFwd[index].name}</p>
                      <p>£{selectedFwd[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <TransferGkModal
          show={showGkTransferModal}
          onClose={() => setShowGkTransferModal(false)}
          gkOptions={gkOptions}
          budget={budget}
          setBudget={setBudget}
          setTransfers={setTransfers}
          transfers={transfers}
          setSelectedGK={setSelectedGK}
          selectedGK={selectedGK || []}
          activeGKIndex={activeGKIndex}
        />

        <TransferDefModal
          show={showDefTransferModal}
          onClose={() => setShowDefTransferModal(false)}
          defOptions={defOptions}
          budget={budget}
          setBudget={setBudget}
          setTransfers={setTransfers}
          transfers={transfers}
          setSelectedDef={setSelectedDef}
          selectedDef={selectedDef || []}
          activeDefIndex={activeDefIndex}
        />

        <TransferMidModal
          show={showMidTransferModal}
          onClose={() => setShowMidTransferModal(false)}
          midOptions={midOptions}
          budget={budget}
          setBudget={setBudget}
          setTransfers={setTransfers}
          transfers={transfers}
          setSelectedMid={setSelectedMid}
          selectedMid={selectedMid || []}
          activeMidIndex={activeMidIndex}
        />

        <TransferFwdModal
          show={showFwdTransferModal}
          onClose={() => setShowFwdTransferModal(false)}
          fwdOptions={fwdOptions}
          budget={budget}
          setBudget={setBudget}
          setTransfers={setTransfers}
          transfers={transfers}
          setSelectedFwd={setSelectedFwd}
          selectedFwd={selectedFwd || []}
          activeFwdIndex={activeFwdIndex}
        />
      </div>

      {transfers < 0 && (
        <div className="minusTransferWarning">
          <h4>Extra transfers result in a -4 points for the next GW</h4>
        </div>
      )}

      {!deadlinePassed && (
        <>
          <div className="saveRow">
            <button onClick={team} disabled={budget < 0}>
              <h4>Save new team</h4>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CreateTeamPage;
