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

import "../../utils/Pitch.css";
import "../../themes/clubThemes.css";
import "./TransferTeam.css";

function CreateTeamPage() {
  const { user } = useUser();
  const { state } = useLocation();
  const { players } = usePlayer();
  const { clubData } = useClub();

  const [budget, setBudget] = useState(user?.budget);
  const [transfers, setTransfers] = useState(user?.transfers);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  const navigate = useNavigate();
  const squad = state?.team;

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
    // value: g.cost, removed as dont think does anythign
    label: `${g.name} - (${g.team})`,
  }));

  //   const [gk, setGk] = useState([]);
  //   const [def, setDef] = useState([]);
  //   const [mid, setMid] = useState([]);
  //   const [fwd, setFwd] = useState([]);

  const [selectedGK, setSelectedGK] = useState(
    Array(clubData.numbGk).fill(null),
  );
  const [activeGKIndex, setActiveGKIndex] = useState(null);

  const [showGkTransferModal, setShowGkTransferModal] = useState(false);
  const [showDefModal, setShowDefModal] = useState(false);
  const [showMidModal, setShowMidModal] = useState(false);
  const [showFwdModal, setShowFwdModal] = useState(false);

  useEffect(() => {
    if (squad && squad.length > 0) {
      setSelectedGK(squad.filter((p) => p.position === "GK"));
      //   setDef(squad.filter((p) => p.position === "DEF"));
      //   setMid(squad.filter((p) => p.position === "MID"));
      //   setFwd(squad.filter((p) => p.position === "FWD"));
    }
  }, [squad]);

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRowSelect">
        <h4>{user?.teamName}</h4>
        <h4>Make Transfers for {currentGW.toLocaleUpperCase()}</h4>
      </div>

      <Countdown targetDate={cutOffDate} onExpired={setDeadlinePassed} />

      <div className="topRowSelect" id="two">
        <h4 className={`budget ${budget < 0 ? "negative" : ""}`}>
          Budget: £{budget.toFixed(2)}m
        </h4>
        <h4 className={`transfer ${transfers < 0 ? "negative" : ""}`}>
          Free Transfers: {transfers}
        </h4>
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

        {/* <div className="defRow">
          <div className="shirtRow">
            {Array.from({ length: def.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button
                  className="shirtButton"
                  onClick={() => {
                    console.log(def[index]);
                  }}
                >
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {def[index] && (
                    <>
                      <p>{def[index].name}</p>
                      <p>£{def[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* <div className="midRow">
          <div className="shirtRow">
            {Array.from({ length: mid.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {mid[index] && (
                    <>
                      <p>{mid[index].name}</p>
                      <p>£{mid[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* <div className="fwdRow">
          <div className="shirtRow">
            {Array.from({ length: fwd.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="transferTag">
                  {fwd[index] && (
                    <>
                      <p>{fwd[index].name}</p>
                      <p>£{fwd[index].cost}m</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div> */}

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
      </div>
    </div>
  );
}

export default CreateTeamPage;
