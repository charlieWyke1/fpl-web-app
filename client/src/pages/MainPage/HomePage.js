import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

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

  const navigate = useNavigate();

  const [hasTeam, setHasTeam] = useState(false);

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
  const tsDate = fixturesTemp.fixtures.cutOff[currentGW];
  const cutOffDate = new Date(tsDate._seconds * 1000);

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

  // all ready to set up the display page for our users Home Page
  // current team is set and so is players - can cross refrence them now to build the team data

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
              <h5>58pts</h5>
            </div>
            <div className="totalPoints">
              <h4>100pts</h4>
            </div>
          </div>
        </div>
      </div>

      <Countdown targetDate={cutOffDate} />

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
