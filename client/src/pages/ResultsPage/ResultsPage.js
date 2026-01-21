import React, { useState } from "react";
import Select from "react-select";
import NavBar from "../NavBar.js";

import { useUser } from "../../context/UserContext.js";
import { usePlayer } from "../../context/PlayerContext.js";
import { useTeam } from "../../context/TeamContext.js";
import { useFixture } from "../../context/FixtureContext.js";
import { auth } from "../../config/firebase.js";

import { getApiBase } from "../../config/api.js";

import "../../themes/clubThemes.css";
import "./ResultsPage.css";

function ResultsPage() {
  const { user } = useUser();
  const { players } = usePlayer();
  const { team } = useTeam(); // stores how many teams in the admins club
  const { fixtures } = useFixture();

  const [checked, setChecked] = useState(false);
  const [currentDataTeamIndex, setCurrentDataTeamIndex] = useState(1);
  const [selectedSquad, setSelectedSquad] = useState("");

  const [selectedSquadTest, setSelectedSquadTest] = useState(null);

  const teamForDataEntry = currentDataTeamIndex; // max it at the number of teams we have in "team"

  const userClub = user?.club;
  const currentGW = user?.currentGW;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const checkKickOff = async (now, newChecked) => {
    const useFixtures = fixtures[`gw${currentGW}`];

    for (const gwId in useFixtures) {
      const squads = useFixtures[gwId];
      const kickOffRaw = squads["kickOff"];

      if (!kickOffRaw) continue;

      const kickOffDate = new Date(kickOffRaw._seconds * 1000);

      if (kickOffDate > now) {
        const hours = String(kickOffDate.getHours()).padStart(2, "0");
        const minutes = String(kickOffDate.getMinutes()).padStart(2, "0");
        const day = String(kickOffDate.getDate()).padStart(2, "0");
        const month = String(kickOffDate.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
        const year = String(kickOffDate.getFullYear()).slice(-2); // last two digits

        const formatted = `${hours}:${minutes} ${day}/${month}/${year}`;
        alert(`The ${gwId} dont kick off until ${formatted}`);
        return false;
      }
    }
    return true;
  };

  const allGk = players.filter((p) => p.position === "GK")
  console.log(allGk)

  // this gets all the fixture info for our current squad we're working with
  // can surely set squad from this and use all the code and shaboom
  const teamFixtures = fixtures[`gw${currentGW}`][`${currentDataTeamIndex}s`];
  const homeData = teamFixtures[`home`];
  const awayData = teamFixtures[`away`];
  const homeTeam = homeData[`club`];
  const awayTeam = awayData[`club`];

  const gkOptions = (allGk || [])
    .filter((g) => g.team === currentDataTeamIndex)
    .map((g) => ({
      value: g.id,
      label: `${g.name} - (${g.team})`,
    }));

  console.log(gkOptions);

  const handleNextTeam = () => {
    if (currentDataTeamIndex < team) {
      setCurrentDataTeamIndex(currentDataTeamIndex + 1);
      // and write data to the database
    } else {
      // and take us back to the admin home page
      console.log("All teams Done");
    }
  };

  return (
    <div className={themeClass}>
      <NavBar />
      {/* okay this is gonna be hardest part yet */}
      <div className="infoRow">
        <h4>
          When entering results, you must wait untill all the games in your
          clubs gameweek are finished
        </h4>
        <div className="checkBoxLine">
          <h4>
            Have all {team} teams at {userClub} completed GameWeek{" "}
            {user.currentGW}?
          </h4>
          <label className="check">
            <input
              type="checkbox"
              checked={checked}
              onChange={async (e) => {
                const newChecked = e.target.checked;
                const now = new Date();

                if (newChecked) {
                  const ok = await checkKickOff(now, newChecked);
                  if (ok) {
                    setChecked(true);
                    setSelectedSquad(currentDataTeamIndex);
                  } else {
                    setChecked(false);
                  }
                } else {
                  setChecked(false);
                }
              }}
            />
            {"  "}Yes!
          </label>
        </div>
      </div>

      {checked && (
        <>
          {/* now we need all the entering stuff */}
          <div className="secondInfoRow">
            <h4>
              Gameweek <b>{currentGW}</b> for the <b>{currentDataTeamIndex}s</b>{" "}
              - <b>{homeTeam}</b> vs <b>{awayTeam}</b>
            </h4>
          </div>

          <button onClick={handleNextTeam}>click me</button>
        </>
      )}
    </div>
  );
}

export default ResultsPage;
