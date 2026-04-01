import React from "react";
import { useState, useEffect } from "react";

import { useAllTeam } from "../../context/AllTeamsContext.js";
import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";

import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";

import "../../utils/Pitch.css";
import "./PointsHistory.css";

import "../../themes/clubThemes.css";

function PointsHistory() {
  const { allTeam } = useAllTeam();
  const { user } = useUser();
  const { players } = usePlayers(user);
  const { clubData } = useClub();

  const [displayTeam, setDisplayTeam] = useState([]);
  const [changeGw, setChangeGw] = useState(`gw${user?.currentGW}`);
  const [points, setPoints] = useState(0);

  const [startingGk, setStartingGk] = useState([]);
  const [startingDef, setStartingDef] = useState([]);
  const [startingMid, setStartingMid] = useState([]);
  const [startingFwd, setStartingFwd] = useState([]);
  const [startingSub, setStartingSub] = useState([]);

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const gkShirt = clubData.gkShirt;
  const playerShirt = clubData.playerShirt;

  useEffect(() => {
    if (allTeam.length === 0) return;

    if (user?.currentGW === 1) {
      console.log("no games played - no points yet");
      const gw1Team = allTeam?.[`${currentGW}`]?.team;
      const gw1DataTeam = matchPlayerData(gw1Team);
      setDisplayTeam(gw1DataTeam);
    } else {
      const prev = `gw${user?.currentGW - 1}`;
      setChangeGw(prev);
      const startDisplayTeam = allTeam?.[`${prev}`]?.team;
      const startDataTeam = matchPlayerData(startDisplayTeam);
      setDisplayTeam(startDataTeam);

      const gwTemp = startDataTeam.reduce((total, player) => {
        if (!player?.isStarting) return total;

        return total + (Number(player.gwPoints) || 0);
      }, 0);
      setPoints(gwTemp);
      updateTeam(`gw${user?.currentGW - 1}`);
    }
  }, [allTeam]);

  const matchPlayerData = (data) => {
    return data
      .map((tp) => {
        const player = players.find((p) => p.id === tp.id);
        if (!player) return null;
        return { ...player, ...tp };
      })
      .filter(Boolean);
  };

  const nextGw = () => {
    const number = parseInt(changeGw.slice(2), 10);
    if (changeGw === currentGW) {
      return;
    }
    setChangeGw("gw" + (number + 1));
    const next = "gw" + (number + 1);
    updateTeam(next);
  };

  const prevGw = () => {
    const number = parseInt(changeGw.slice(2), 10);
    if (number === 1) {
      setChangeGw("gw1");
      return;
    }
    setChangeGw("gw" + (number - 1));
    const prev = "gw" + (number - 1);
    updateTeam(prev);
  };

  const updateTeam = (updatedGw) => {
    const team = allTeam?.[`${updatedGw}`]?.team;
    const dataTeam = matchPlayerData(team);
    setDisplayTeam(dataTeam);

    const gwTemp = dataTeam.reduce((total, player) => {
      if (!player?.isStarting) return total;

      return total + (Number(player.gwPoints) || 0);
    }, 0);
    setPoints(gwTemp);

    setStartingGk(
      dataTeam.filter((p) => p.position === "GK" && p.isStarting === true),
    );
    setStartingDef(
      dataTeam.filter((p) => p.position === "DEF" && p.isStarting === true),
    );
    setStartingMid(
      dataTeam.filter((p) => p.position === "MID" && p.isStarting === true),
    );
    setStartingFwd(
      dataTeam.filter((p) => p.position === "FWD" && p.isStarting === true),
    );
    setStartingSub(dataTeam.filter((p) => p.isStarting === false));
  };

  // displayTeam has all the updated team data we will need
  // now just need to display it on our pitch !

  return (
    <div className={themeClass}>
      <NavBar />
      <div className="topRow2">
        <button onClick={prevGw}>&larr;</button>

        <h4>{changeGw.toLocaleUpperCase()}</h4>

        <button onClick={nextGw}>&rarr;</button>
      </div>

      <div className="ptsRow">
        <h4>{points} pts</h4>
      </div>

      <div className="selectedTeamContainer HomePage">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          {Array.from({ length: startingGk.length }).map((_, index) => (
            <div key={index} className="shirtContainer">
              <button className="shirtButton">
                <ShirtSvg className={`gkShirt`} color={gkShirt} size={100} />
              </button>
              <div className="homePageTag">
                {startingGk[index] && (
                  <>
                    <p>{startingGk[index].name}</p>
                    <p>{startingGk[index].gwPoints}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="defRow">
          <div className="shirtRow">
            {Array.from({ length: startingDef.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg
                    className={`shirt`}
                    color={playerShirt}
                    size={100}
                  />
                </button>
                <div className="homePageTag">
                  {startingDef[index] && (
                    <>
                      <p>{startingDef[index].name}</p>
                      <p>{startingDef[index].gwPoints}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="midRow">
          <div className="shirtRow">
            {Array.from({ length: startingMid.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg
                    className={`shirt`}
                    color={playerShirt}
                    size={100}
                  />
                </button>
                <div className="homePageTag">
                  {startingMid[index] && (
                    <>
                      <p>{startingMid[index].name}</p>
                      <p>{startingMid[index].gwPoints}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fwdRow">
          <div className="shirtRow">
            {Array.from({ length: startingFwd.length }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg
                    className={`shirt`}
                    color={playerShirt}
                    size={100}
                  />
                </button>
                <div className="homePageTag">
                  {startingFwd[index] && (
                    <>
                      <p>{startingFwd[index].name}</p>
                      <p>{startingFwd[index].gwPoints}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="subRow">
        <div className="shirtRow">
          {Array.from({ length: startingSub.length }).map((_, index) => (
            <div key={index} className="shirtContainer">
              <button className="shirtButton">
                {startingSub[index].position === "GK" && (
                  <ShirtSvg className={`gkShirt`} color={gkShirt} />
                )}
                {startingSub[index].position !== "GK" && (
                  <ShirtSvg className={`shirt`} color={playerShirt} />
                )}
              </button>
              <div className="homePageTag">
                {startingSub[index] && (
                  <>
                    <p>{startingSub[index].name}</p>
                    <p>{startingSub[index].gwPoints}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PointsHistory;
