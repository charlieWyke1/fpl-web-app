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
  const allGk = players.filter((p) => p.position === "GK");
  const allDef = players.filter((p) => p.position === "DEF");
  const allMid = players.filter((p) => p.position === "MID");
  const allFwd = players.filter((p) => p.position === "FWD");

  const [selectedGK, setSelectedGK] = useState([]);
  const [selectedDef, setSelectedDef] = useState([]);
  const [selectedMid, setSelectedMid] = useState([]);
  const [selectedFwd, setSelectedFwd] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState([]);

  const [userClubGoals, setUserClubGoals] = useState(0);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [oppo, setOppo] = useState("");
  // const [cleanSheet, setCleanSheet] = useState(false);

  const [selectedGoalscorers, setSelectedGoalscorers] = useState("");
  const [selectedAssists, setSelectedAssists] = useState([]);
  const [selectedYellows, setSelectedYellows] = useState([]);
  const [selectedReds, setSelectedReds] = useState([]);
  const [selectedPenSaves, setSelectedPenSaves] = useState("");

  const [selectedTeamSheet, setSelectedTeamSheet] = useState(null);

  const gkOptions = (allGk || [])
    .filter((g) => g.team === selectedSquad)
    .map((g) => ({
      value: g.id,
      label: `${g.name} - (${g.team})`,
    }));

  const defOptions = (allDef || [])
    .filter((d) => d.team === selectedSquad)
    .map((d) => ({ value: d.id, label: `${d.name} - (${d.team})` }));

  const midOptions = (allMid || [])
    .filter((m) => m.team === selectedSquad)
    .map((m) => ({ value: m.id, label: `${m.name} - (${m.team})` }));

  const fwdOptions = (allFwd || [])
    .filter((f) => f.team === selectedSquad)
    .map((f) => ({ value: f.id, label: `${f.name} - (${f.team})` }));

  // const subOptions =

  const currentGW = user?.currentGW;
  const squadFixtures = fixtures[selectedSquad] || [];
  const gwFixture = squadFixtures?.[`gw${currentGW}`]?.fixture1;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const goalsOptions = selectedTeamSheet?.map((player) => ({
    value: player.value,
    label: player.label,
    playerId: player.value,
  }));

  const assistOptions = selectedTeamSheet?.map((player) => ({
    value: player.value,
    label: player.label,
    playerId: player.value,
  }));

  // allows us to enter multiple goals by the same player
  const handleDuplicateScorer = (option) => {
    if (!option || option.length === 0) {
      // user cleared all selections
      setSelectedGoalscorers([]);
      return;
    }
    // Get the last item selected
    const last = option[option.length - 1];
    if (!last) return;
    // Count how many times this player is already selected
    const count = selectedGoalscorers.filter(
      (s) => s.playerId === last.playerId,
    ).length;
    // Add a new instance if under the goal limit
    if (selectedGoalscorers.length < userClubGoals) {
      setSelectedGoalscorers([
        ...selectedGoalscorers,
        { ...last, value: `${last.value}-${count}` },
      ]);
    }
  };

  // same as for goals but for assists
  const handleDuplicateAssist = (option) => {
    if (!option || option.length === 0) {
      // user cleared all selections
      setSelectedAssists([]);
      return;
    }
    const last = option[option.length - 1];
    if (!last) return;
    const count = selectedAssists.filter(
      (s) => s.playerId === last.playerId,
    ).length;
    if (selectedAssists.length < userClubGoals) {
      setSelectedAssists([
        ...selectedAssists,
        { ...last, value: `${last.value}-${count}` },
      ]);
    }
  };

  const handleSquadChange = (e) => {
    const newSquad = e.target.value;
    setSelectedSquad(newSquad);

    // Reset selected players when changing squad
    setSelectedGK("");
    setSelectedDef([]);
    setSelectedMid([]);
    setSelectedFwd([]);
  };

  // FOR THE TEAMSHEET SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const teamSheet = [
      selectedGK,
      ...selectedDef,
      ...selectedMid,
      ...selectedFwd,
    ];
    console.log(teamSheet.length);
    if (teamSheet.length !== 11) {
      alert("Please select exactly 11 players for the team sheet.");
      setSelectedTeamSheet(null);
      return;
    } else {
      setSelectedTeamSheet(teamSheet);
      if (gwFixture?.home?.club === userClub) {
        setOppo("away");
      }
      if (gwFixture?.away?.club === userClub) {
        setOppo("home");
      }
    }
  };

  // FOR THE MATCH STATS SUBMISSION
  const handleSubmitMatchStats = async (e) => {
    e.preventDefault();
    // handle the match stats being added
    // 1. write to our database fixtures section and update home score and away score and change from upcoming to played

    const cleanSheet =
      (oppo === "home" && Number(homeGoals) === 0) ||
      (oppo === "away" && Number(awayGoals) === 0);

    // console.log(cleanSheet);
    // console.log(oppo);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${getApiBase()}/api/results/updateScore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeScore: homeGoals,
          awayScore: awayGoals,
          club: userClub,
          squad: selectedSquad,
          gw: currentGW,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Fixture score updated successfully!");
        // reset form and teamsheet
        setHomeGoals(0);
        setAwayGoals(0);
        setUserClubGoals(0);
        setSelectedSquad("");
        setSelectedGoalscorers([]);
        setSelectedAssists([]);
        setSelectedYellows([]);
        setSelectedReds([]);
        setSelectedPenSaves("");
        setSelectedTeamSheet(null);
        setSelectedGK([]);
        setSelectedDef([]);
        setSelectedMid([]);
        setSelectedFwd([]);
        // now update currentGW for user
        try {
          const token2 = await auth.currentUser.getIdToken();
          const res2 = await fetch(
            `${getApiBase()}/api/results/updateCurrentGW`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token2}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: user.id,
                newGW: currentGW + 1,
              }),
            },
          );
          const data2 = await res2.json();
          if (data2.success) {
            user.currentGW = currentGW + 1; // update locally
          }
        } catch (error) {
          console.error("Error updating current GW:", error);
        }
      }
      // now need to write player stats and update currentGW

      const countOccurrences = (arr, playerId) => {
        return arr.filter((item) => item.playerId === playerId).length;
      };

      const buildPlayerPoints = (
        selectedTeamSheet,
        goals,
        assists,
        yellows,
        reds,
        cleanSheet,
        // started
      ) => {
        return selectedTeamSheet.map((player) => {
          const playerId = player.playerId || player.value; // depending on your structure

          const goalsCount = countOccurrences(goals, playerId);
          const assistsCount = countOccurrences(assists, playerId);
          const yellowsCount = countOccurrences(yellows, playerId);
          const redsCount = countOccurrences(reds, playerId);

          const gwPoints =
            goalsCount * 7 +
            assistsCount * 4 +
            yellowsCount * -1 +
            redsCount * -3 +
            (cleanSheet ? 4 : 0);

          return {
            playerId,
            goals: goalsCount,
            assists: assistsCount,
            yellows: yellowsCount,
            reds: redsCount,
            // started: started,
            cleanSheet: cleanSheet,
            gwPoints: gwPoints + 2, // adding 2 for playing
          };
        });
      };

      const playerPoints = buildPlayerPoints(
        selectedTeamSheet,
        selectedGoalscorers,
        selectedAssists,
        selectedYellows,
        selectedReds,
        cleanSheet,
        // (started = true)
      );
      // console.log("Player Points Data:", playerPoints);
      // console.log(cleanSheet);
      try {
        const token3 = await auth.currentUser.getIdToken();
        const res3 = await fetch(
          `${getApiBase()}/api/results/updatePlayerPoints`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token3}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playerData: playerPoints,
              gw: currentGW,
            }),
          },
        );
        const data3 = await res3.json();
        if (data3.success) {
          console.log("Player points updated successfully!");
        }
      } catch (error) {
        console.error("Error updating player points:", error);
      }
    } catch (error) {
      console.error("Error updating fixture score:", error);
    }
  };

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

  const handleNextTeam = () => {
    if (currentDataTeamIndex < team) {
      setCurrentDataTeamIndex(currentDataTeamIndex + 1);
      // and write data to the database
    } else {
      console.log("All teams Done");
    }
  };

  // this gets all the fixture info for our current team we're working with
  // can surely set squad from this and use all the code and shaboom
  const teamFixtures = fixtures[`gw${currentGW}`][`${currentDataTeamIndex}s`]; 

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
          <h4> {currentDataTeamIndex} </h4>
          <button onClick={handleNextTeam}>click me</button>
        </>
      )}
    </div>
  );
}

export default ResultsPage;
