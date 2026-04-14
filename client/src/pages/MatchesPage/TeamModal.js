import { useEffect, useState } from "react";
import React from "react";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";

import "./TeamModal.css";
import "../../themes/clubThemes.css";
import "../../utils/Pitch.css";

import ShirtSvg from "../../svgFolder/ShirtSVG.js";

const TeamModal = ({ squad, fixtureDetails, fixtureGw, game, onClose }) => {
  const { user } = useUser();
  const { clubData } = useClub();
  const userClub = user?.club;

  const [startingGk, setStartingGk] = useState([]);
  const [startingDef, setStartingDef] = useState([]);
  const [startingMid, setStartingMid] = useState([]);
  const [startingFwd, setStartingFwd] = useState([]);

  const [usedSubs, setUsedSubs] = useState([]);

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const gkShirt = clubData.gkShirt;
  const playerShirt = clubData.playerShirt;

  const number = parseInt(fixtureGw.slice(2), 10);

  useEffect(() => {
    const team = fixtureDetails.gwTeam;
    const number = parseInt(fixtureGw.slice(2), 10);
    setStartingGk(
      team.filter(
        (p) => p.position === "GK" && p.gameweeks?.[number]?.started === true,
      ),
    );
    setStartingDef(
      team.filter(
        (p) => p.position === "DEF" && p.gameweeks?.[number]?.started === true,
      ),
    );
    setStartingMid(
      team.filter(
        (p) => p.position === "MID" && p.gameweeks?.[number]?.started === true,
      ),
    );
    setStartingFwd(
      team.filter(
        (p) => p.position === "FWD" && p.gameweeks?.[number]?.started === true,
      ),
    );
    setUsedSubs(team.filter((p) => p.gameweeks?.[number]?.subbedOn === true));
  }, []);

  return (
    <div className="modalOverlayTeam" onClick={onClose}>
      <div
        className={`modalContainerTeam ${themeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalTeamHeader">
          <button onClick={onClose}>X</button>
          <h4>
            {game.homeTeam} ({game.homeSquad}s){" "}
            <b>
              {game.homeScore} - {game.awayScore}
            </b>{" "}
            {game.awayTeam} ({game.awaySquad}
            s)
          </h4>
        </div>
        <div className="modalTeamBody">
          <div className="selectedTeamContainer ModalPitch">
            <div className="penalty-box top"></div>
            <div className="six-yard-box top"></div>
            <div className="penalty-arc top"></div>
            <div className="halfway-line"></div>

            <div className="pitch">
              <div className="gkRow">
                {Array.from({ length: startingGk.length }).map((_, index) => (
                  <div key={index} className="shirtContainer">
                    <div className="shirtButton">
                      <ShirtSvg className={`gkShirt`} color={gkShirt} />
                    </div>
                    <div className="homePageTag">
                      {startingGk[index] && (
                        <>
                          <h4>{startingGk[index].name}</h4>
                          <h5>
                            {startingGk[index].gameweeks?.[number]?.gwPoints}
                          </h5>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="defRow">
                <div className="shirtRow">
                  {Array.from({ length: startingDef.length }).map(
                    (_, index) => (
                      <div key={index} className="shirtContainer">
                        <div className="shirtButton">
                          <ShirtSvg className={`shirt`} color={playerShirt} />
                        </div>
                        <div className="homePageTag">
                          {startingDef[index] && (
                            <>
                              <h4>{startingDef[index].name}</h4>
                              <h5>
                                {
                                  startingDef[index].gameweeks?.[number]
                                    ?.gwPoints
                                }
                              </h5>
                            </>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="midRow">
                <div className="shirtRow">
                  {Array.from({ length: startingMid.length }).map(
                    (_, index) => (
                      <div key={index} className="shirtContainer">
                        <div className="shirtButton">
                          <ShirtSvg className={`shirt`} color={playerShirt} />
                        </div>
                        <div className="homePageTag">
                          {startingMid[index] && (
                            <>
                              <h4>{startingMid[index].name}</h4>
                              <h5>
                                {
                                  startingMid[index].gameweeks?.[number]
                                    ?.gwPoints
                                }
                              </h5>
                            </>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="fwdRow">
                <div className="shirtRow">
                  {Array.from({ length: startingFwd.length }).map(
                    (_, index) => (
                      <div key={index} className="shirtContainer">
                        <div className="shirtButton">
                          <ShirtSvg className={`shirt`} color={playerShirt} />
                        </div>
                        <div className="homePageTag">
                          {startingFwd[index] && (
                            <>
                              <h4>{startingFwd[index].name}</h4>
                              <h5>
                                {
                                  startingFwd[index].gameweeks?.[number]
                                    ?.gwPoints
                                }
                              </h5>
                            </>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="subRow">
            <div className="shirtRow">
              {Array.from({ length: usedSubs.length }).map((_, index) => (
                <div key={index} className="shirtContainer">
                  <div className="shirtButton">
                    <ShirtSvg className={`shirt`} color={playerShirt} />
                  </div>
                  <div className="homePageTag">
                    {usedSubs[index] && (
                      <>
                        <h4>{usedSubs[index].name}</h4>
                        <h5>{usedSubs[index].gameweeks?.[number]?.gwPoints}</h5>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
