import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useAllTeam } from "../../context/AllTeamsContext.js";
// import { useAllClub } from "../../context/AllClubUsersContext.js";

import { useNavigate } from "react-router-dom";

import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";
import { useHasTeamContextFiller } from "../../hooks/useHasTeamContextFiller.js";
import { useClubUsers } from "../../hooks/useClubUsers.js";

import { getApiBase } from "../../config/api.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import Countdown from "../../utils/Countdown.js";

import "./HomePage.css";
import "../../utils/Pitch.css";

import "../../themes/clubThemes.css";

function HomePage() {
  const { user } = useUser();
  useClubUsers(user); // does it automatically

  // const { allUsers, setAllUsers } = useAllClub();
  const { players, loadingPlayers, refetchPlayers } = usePlayers(user);
  const { allTeam } = useAllTeam();

  const navigate = useNavigate();

  const [cutOffDate, setCutOffDate] = useState(0);

  const [hasTeam, setHasTeam] = useState(false);
  const [pointsTeam, setPointsTeam] = useState([]);
  const [nextTeam, setNextTeam] = useState([]);
  const [view, setView] = useState("points");
  const [totalGwPoints, setTotalGwPoints] = useState(0);
  const [totalSeasonPoints, setTotalSeasonPoints] = useState(0);

  const [startingGk, setStartingGk] = useState([]);
  const [startingDef, setStartingDef] = useState([]);
  const [startingMid, setStartingMid] = useState([]);
  const [startingFwd, setStartingFwd] = useState([]);
  const [startingSub, setStartingSub] = useState([]);
  const [minusPts, setMinusPts] = useState(0);

  const [deadlinePassed, setDeadlinePassed] = useState(false);

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // check if our user has a team
  useEffect(() => {
    const checkTeam = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${getApiBase()}/api/team/checkTeamExistence`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await res.json();

        if (data.exists === false) {
          //   navigate to create team page
          navigate("/CreateTeam");
        } else {
          setHasTeam(true);
          setView("points");
        }
      } catch (error) {
        console.error("Error checking team existence:", error);
      }
    };

    checkTeam();
  }, [user]);

  // gets players and the most up to date version of it
  useHasTeamContextFiller(hasTeam ? user : null, refetchPlayers);

  // KEEP currentTeam simple, only playerId and starting boolean
  // make use of the joinedTeamList for the data side of stuff

  // everything from here only works if we HAVE a team

  const fixturesTemp = useFixtures(user);

  useEffect(() => {
    if (!fixturesTemp?.fixtures?.cutOff) return;
    if (!currentGW) return;

    const tsDate = fixturesTemp.fixtures.cutOff[currentGW];
    if (!tsDate) return;

    setCutOffDate(new Date(tsDate._seconds * 1000));
  }, [currentGW]);

  // NEXT UP
  // league stuff

  useEffect(() => {
    if (allTeam.length === 0) return;

    if (user?.currentGW === 1) {
      // if gw1 then both teams have to be set for gw1
      setNextTeam(allTeam?.[`${currentGW}`]?.team);
      setPointsTeam(allTeam?.[`${currentGW}`]?.team);
    } else {
      // temp for now
      // when we have gw2 pts shld be gw1, next team gw2
      const prevGW = `gw${user?.currentGW - 1}`;
      setPointsTeam(allTeam?.[`${prevGW}`]?.team);
      setNextTeam(allTeam?.[`${currentGW}`]?.team);
    }
  }, [allTeam]);

  useEffect(() => {
    if (allTeam.length === 0) return;

    if (view === "points") {
      const pointsAndDataTeam = matchPlayerData(pointsTeam);
      // setDataTeamStateSend(pointsAndDataTeam);
      const gwTemp = pointsAndDataTeam.reduce((total, player) => {
        if (!player?.isStarting) return total;

        return total + (Number(player.gwPoints) || 0);
      }, 0);

      if (user?.currentGW === 1) {
        setMinusPts(allTeam?.[`gw${user?.currentGW}`].minusPoints);
      } else {
        setMinusPts(allTeam?.[`gw${user?.currentGW - 1}`].minusPoints);
      }
      setTotalGwPoints(gwTemp + minusPts);
      // setTotalGwPoints(gwTemp);

      const totalSeasonPoints = Object.values(allTeam)
        .filter((gw) => gw.locked)
        .reduce((acc, gw) => {
          const pointsThisGW = gw.team.reduce((sum, player) => {
            return player?.isStarting
              ? sum + (Number(player.gwPoints) || 0)
              : sum;
          }, 0);

          const minus = Number(gw.minusPoints) || 0;

          return acc + (pointsThisGW + minus);
        }, 0);
      setTotalSeasonPoints(totalSeasonPoints);

      setStartingGk(
        pointsAndDataTeam.filter(
          (p) => p.position === "GK" && p.isStarting === true,
        ),
      );
      setStartingDef(
        pointsAndDataTeam.filter(
          (p) => p.position === "DEF" && p.isStarting === true,
        ),
      );
      setStartingMid(
        pointsAndDataTeam.filter(
          (p) => p.position === "MID" && p.isStarting === true,
        ),
      );
      setStartingFwd(
        pointsAndDataTeam.filter(
          (p) => p.position === "FWD" && p.isStarting === true,
        ),
      );
      setStartingSub(pointsAndDataTeam.filter((p) => p.isStarting === false));
    }
    if (view === "team") {
      const nextAndDataTeam = matchPlayerData(nextTeam);
      // setNextTeamStateSend(nextAndDataTeam);
      // set team for upcoming gw
      setStartingGk(
        nextAndDataTeam.filter(
          (p) => p.position === "GK" && p.isStarting === true,
        ),
      );
      setStartingDef(
        nextAndDataTeam.filter(
          (p) => p.position === "DEF" && p.isStarting === true,
        ),
      );
      setStartingMid(
        nextAndDataTeam.filter(
          (p) => p.position === "MID" && p.isStarting === true,
        ),
      );
      setStartingFwd(
        nextAndDataTeam.filter(
          (p) => p.position === "FWD" && p.isStarting === true,
        ),
      );
      setStartingSub(nextAndDataTeam.filter((p) => p.isStarting === false));
    }
  }, [view, allTeam, pointsTeam, nextTeam]);

  const matchPlayerData = (data) => {
    return data
      .map((tp) => {
        const player = players.find((p) => p.id === tp.id);
        if (!player) return null;
        return { ...player, ...tp };
      })
      .filter(Boolean);
  };

  const handleSelectTeam = () => {
    if (deadlinePassed) {
      alert("Deadline has passed, you can no longer edit your team!");
      return;
    }
    navigate("/SelectTeam", {
      state: { team: matchPlayerData(nextTeam) },
    });
  };

  const handleTransferTeam = () => {
    if (deadlinePassed) {
      alert("Deadline has passed, you can no longer edit your team!");
      return;
    }
    navigate("/TransferTeam", {
      state: { team: matchPlayerData(nextTeam) },
    });
  };

  const handlePoints = () => {
    navigate("/PointsHistory");
  };

  const handleLeague = () => {
    navigate("/Leagues");
  };

  if (!hasTeam) {
    return (
      <div className={themeClass}>
        <NavBar />
      </div>
    );
  }

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRow">
        <div className="teamRow">
          <div className="teamName">
            <h4>{user.teamName}</h4>
          </div>
          <div className="ptsShow">
            <div className="gwPoints">
              <h5>{totalGwPoints}pts</h5>
            </div>
            <div className="totalPoints">
              <h4>{totalSeasonPoints}pts</h4>
            </div>
          </div>
        </div>
      </div>

      <Countdown targetDate={cutOffDate} onExpired={setDeadlinePassed} />

      {/* only give user the option to flick between teams when there is +1 weeks of data */}
      {user?.currentGW > 1 && (
        <div className="secondRow">
          <div className="teamChoice">
            <button
              className={`teamChoice ${view === "points" ? "selected" : ""}`}
              onClick={() => setView("points")}
            >
              <h4>View Last Weeks Points</h4>
            </button>

            <button
              className={`teamChoice ${view === "team" ? "selected" : ""}`}
              onClick={() => setView("team")}
            >
              <h4>View Next Weeks Team</h4>
            </button>
          </div>

          <div className="secondRowInfo">
            {view === "points" && (
              <>
                <h4>
                  Points from GW{user?.currentGW - 1} - {totalGwPoints}pts
                </h4>
                {minusPts !== 0 && (
                  <h4 id="minusDisplay">
                    | ( {minusPts}) transfer minus points
                  </h4>
                )}
              </>
            )}
            {view === "team" && (
              <h4>Team for {currentGW.toLocaleUpperCase()} </h4>
            )}
          </div>
        </div>
      )}

      <div className="selectedTeamContainer HomePage">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          {Array.from({ length: startingGk.length }).map((_, index) => (
            <div key={index} className="shirtContainer">
              <button className="shirtButton">
                <ShirtSvg className={`gkShirt ${themeClass}`} size={100} />
              </button>
              <div className="homePageTag">
                {startingGk[index] && (
                  <>
                    <p>{startingGk[index].name}</p>
                    {view === "points" && <p>{startingGk[index].gwPoints}</p>}
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
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="homePageTag">
                  {startingDef[index] && (
                    <>
                      <p>{startingDef[index].name}</p>
                      {view === "points" && (
                        <p>{startingDef[index].gwPoints}</p>
                      )}
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
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="homePageTag">
                  {startingMid[index] && (
                    <>
                      <p>{startingMid[index].name}</p>
                      {view === "points" && (
                        <p>{startingMid[index].gwPoints}</p>
                      )}
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
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
                <div className="homePageTag">
                  {startingFwd[index] && (
                    <>
                      <p>{startingFwd[index].name}</p>
                      {view === "points" && (
                        <p>{startingFwd[index].gwPoints}</p>
                      )}
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
                  <ShirtSvg className={`gkShirt ${themeClass}`} size={100} />
                )}
                {startingSub[index].position !== "GK" && (
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                )}
              </button>
              <div className="homePageTag">
                {startingSub[index] && (
                  <>
                    <p>{startingSub[index].name}</p>
                    {view === "points" && <p>{startingSub[index].gwPoints}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="homePageOpts">
        <button onClick={handleSelectTeam}>
          <h4>Select Next Weeks Team</h4>
        </button>

        <button onClick={handleTransferTeam}>
          <h4>Make Transfers</h4>
        </button>

        <button onClick={handlePoints}>
          <h4>View Point History</h4>
        </button>

        <button onClick={handleLeague}>
          <h4>Leagues and shit</h4>
          {/* FINAL JOB HERE */}
        </button>
      </div>
    </div>
  );
}

export default HomePage;
