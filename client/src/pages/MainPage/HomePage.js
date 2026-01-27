import React from "react";
import { useState, useEffect, useMemo } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";
import { useAllTeam } from "../../context/AllTeamsContext.js";

import { useNavigate } from "react-router-dom";

import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";
import { useHasTeamContextFiller } from "../../hooks/useHasTeamContextFiller.js";

import { getApiBase } from "../../config/api.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import Countdown from "../../utils/Countdown.js";

import "./HomePage.css";
import "../../utils/Pitch.css";

import "../../themes/clubThemes.css";

// NEED TO CHECK IF OUR USER IS AN ADMIN HERE
// AS IF they're not an admin they will have none of the context data
// need to check and give them
// - fixtures, allUsers, all players, current user ...

// also if player has akready got their team set up
// we need to load in all the data as well

function HomePage() {
  const { user } = useUser();
  const { currentTeam, setCurrentTeam } = useCurrentTeam();
  const { players, loadingPlayers, refetchPlayers } = usePlayers(user);
  const { allTeam } = useAllTeam();

  const navigate = useNavigate();

  const [hasTeam, setHasTeam] = useState(false);
  const [pointsTeam, setPointsTeam] = useState([]);
  const [nextTeam, setNextTeam] = useState([]);
  const [view, setView] = useState("points");
  const [totalGwPoints, setTotalGwPoints] = useState(0);
  const [totalSeasonPoints, setTotalSeasonPoints] = useState(0);

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
          // need to populate contexts for if user hasnt gone thru their set up of first team
        }
      } catch (error) {
        console.error("Error checking team existence:", error);
      }
    };

    checkTeam();
  }, [user]);

  // gets players and the most up to date version of it
  useHasTeamContextFiller(hasTeam ? user : null, refetchPlayers);

  // this does nothing atm
  const joinedTeamList = currentTeam.map((teamPlayer) => {
    const fullPlayerData = players.find((p) => p.id === teamPlayer.id);
    return {
      ...fullPlayerData,
      isStarting: teamPlayer.isStarting,
    };
  });

  // KEEP currentTeam simple, only playerId and starting boolean
  // make use of the joinedTeamList for the data side of stuff

  // everything from here only works if we HAVE a team

  const fixturesTemp = useFixtures(user);
  // const tsDate = fixturesTemp.fixtures.cutOff[currentGW];
  // const cutOffDate = new Date(tsDate._seconds * 1000);

  const startingGk = joinedTeamList.filter(
    (p) => p.position === "GK" && p.isStarting === true,
  );
  const startingDef = joinedTeamList.filter(
    (p) => p.position === "DEF" && p.isStarting === true,
  );
  const startingMid = joinedTeamList.filter(
    (p) => p.position === "MID" && p.isStarting === true,
  );
  const startingFwd = joinedTeamList.filter(
    (p) => p.position === "FWD" && p.isStarting === true,
  );

  const allSubs = joinedTeamList.filter((p) => p.isStarting === false);

  // console.log(allTeam)
  // console.log(currentTeam)
  // setCurrentTeam(allTeam[x])
  // NEXT UP
  // function to get teams total Points and gw points

  // giove option to display team as points (gw-1) or next team (gw)
  // transfers
  // pick team
  // view points

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
      // map thru here and count points
      const gwTemp = pointsAndDataTeam.reduce((total, player) => {
        if (!player?.isStarting) return total;

        return total + (Number(player.gwPoints) || 0);
      }, 0);
      setTotalGwPoints(gwTemp);

      const x = Object.values(allTeam)
        .filter((gw) => gw.locked)
        .flatMap((gw) => gw.team);
      const totalTemp = x.reduce((sum, player) => {
        if (!player?.isStarting) return sum;

        return sum + (Number(player.gwPoints) || 0)
      }, 0)
      setTotalSeasonPoints(totalTemp)
    }
    if (view === "team") {
      const nextAndDataTeam = matchPlayerData(nextTeam);
    }
  });

  const matchPlayerData = (data) => {
    return data
      .map((tp) => {
        const player = players.find((p) => p.id === tp.id);
        if (!player) return null;
        return { ...player, ...tp };
      })
      .filter(Boolean);
  };

  // displays all points gw and total !!

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

      {/* <Countdown targetDate={cutOffDate} /> */}

      {/* only give user the option to flick between teams when there is +1 weeks of data */}
      {user?.currentGW > 1 && (
        <div className="teamChoice">
          <button onClick={() => setView("points")}>
            <h4>View Points</h4>
          </button>

          <button onClick={() => setView("team")}>
            <h4>View Team</h4>
          </button>
        </div>
      )}

      <div className="selectedTeamContainer HomePage">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>
      </div>
    </div>
  );
}

export default HomePage;
