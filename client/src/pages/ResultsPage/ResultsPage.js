import React, { useState, useEffect } from "react";
import Select from "react-select";
import NavBar from "../NavBar.js";

import { useUser } from "../../context/UserContext.js";
import { usePlayer } from "../../context/PlayerContext.js";
import { useTeam } from "../../context/TeamContext.js";
import { useFixture } from "../../context/FixtureContext.js";
import { useAllClub } from "../../context/AllClubUsersContext.js";

import { auth } from "../../config/firebase.js";

import { getApiBase } from "../../config/api.js";

import { useNavigate } from "react-router-dom";

import "../../themes/clubThemes.css";
import "./ResultsPage.css";

function ResultsPage() {
  const { user, setUser } = useUser();
  const { players } = usePlayer();
  const { team } = useTeam(); // stores how many teams in the admins club
  const { fixtures } = useFixture();
  const { allUsers } = useAllClub();

  const navigate = useNavigate();

  const [checked, setChecked] = useState(false);
  const [currentDataTeamIndex, setCurrentDataTeamIndex] = useState(1);
  const [selectedSquad, setSelectedSquad] = useState("");

  const [selectedGK, setSelectedGK] = useState([]);
  const [selectedDef, setSelectedDef] = useState([]);
  const [selectedMid, setSelectedMid] = useState([]);
  const [selectedFwd, setSelectedFwd] = useState([]);

  const [selectedSub, setSelectedSub] = useState([]);

  const [selectedTeamSheet, setSelectedTeamSheet] = useState(null);
  const [temp, setTemp] = useState(false);

  const [userClubGoals, setUserClubGoals] = useState(0);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [oppo, setOppo] = useState("");

  const [selectedGoalscorers, setSelectedGoalscorers] = useState("");
  const [selectedAssists, setSelectedAssists] = useState([]);
  const [selectedYellows, setSelectedYellows] = useState([]);
  const [selectedReds, setSelectedReds] = useState([]);

  const [allPts, setAllPts] = useState([]);
  // const teamForDataEntry = currentDataTeamIndex; // max it at the number of teams we have in "team"

  const userClub = user?.club;
  const currentGW = user?.currentGW;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const SCORING = {
    GOAL: 7,
    ASSIST: 5,
    CLEAN_SHEET: 4,
    YELLOW: -1,
    RED: -3,
    STARTED: 2,
    COMEON: 1,
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

  const allGk = players.filter((p) => p.position === "GK");
  const allDef = players.filter((p) => p.position === "DEF");
  const allMid = players.filter((p) => p.position === "MID");
  const allFwd = players.filter((p) => p.position === "FWD");
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

  const defOptions = (allDef || [])
    .filter((d) => d.team === currentDataTeamIndex)
    .map((d) => ({ value: d.id, label: `${d.name} - (${d.team})` }));

  const midOptions = (allMid || [])
    .filter((m) => m.team === currentDataTeamIndex)
    .map((m) => ({ value: m.id, label: `${m.name} - (${m.team})` }));

  const fwdOptions = (allFwd || [])
    .filter((f) => f.team === currentDataTeamIndex)
    .map((f) => ({ value: f.id, label: `${f.name} - (${f.team})` }));

  const selectedTeam = [
    selectedGK,
    ...selectedDef,
    ...selectedMid,
    ...selectedFwd,
  ];

  const allPlayers = [
    ...allGk.filter((x) => x.team === currentDataTeamIndex),
    ...allDef.filter((x) => x.team === currentDataTeamIndex),
    ...allMid.filter((x) => x.team === currentDataTeamIndex),
    ...allFwd.filter((x) => x.team === currentDataTeamIndex),
  ];

  const selectedIds = selectedTeam.map((p) => p?.value).filter(Boolean); // removes undefined/null

  const subOpts = (allPlayers || [])
    .filter((p) => !selectedIds.includes(p.id))
    .map((p) => ({
      value: p.id,
      label: `${p.name} - (${p.team})`,
    }));

  // FOR THE TEAMSHEET SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const teamSheet = [
      selectedGK,
      ...selectedDef,
      ...selectedMid,
      ...selectedFwd,
    ];
    const wholeTeamSheet = [
      selectedGK,
      ...selectedDef,
      ...selectedMid,
      ...selectedFwd,
      ...selectedSub,
    ];
    if (teamFixtures.status === true) {
      alert("Data has already been entered for this match, please message");
      handleNextTeam();
    } else {
      if (teamSheet.length !== 11) {
        alert("Please select exactly 11 players for the team sheet.");
        setSelectedTeamSheet(null);
        return;
      } else {
        setSelectedTeamSheet(wholeTeamSheet);
        if (homeTeam === userClub) {
          setOppo("away");
        }
        if (awayTeam === userClub) {
          setOppo("home");
        }
        // console.log(selectedTeamSheet);
        // console.log(wholeTeamSheet);
        // console.log(selectedSub);
      }
      setTemp(true);
    }
  };

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

  const yellowOptions = selectedTeamSheet?.map((player) => ({
    value: player.value,
    label: player.label,
    playerId: player.value,
  }));

  const redOptions = selectedTeamSheet?.map((player) => ({
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

  // exact same logic as for goals but for assists
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

  const handleSubmitMatchStats = async (e) => {
    e.preventDefault();
    const cleanSheet =
      (oppo === "home" && Number(homeGoals) === 0) ||
      (oppo === "away" && Number(awayGoals) === 0);

    if (teamFixtures.status === true) {
      alert("Data has already been entered for this match, please message");
      handleNextTeam();
    } else {
      try {
        console.log(homeGoals, awayGoals, userClub, selectedSquad, currentGW);
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
        if (true) {
          const countOccurrences = (arr, playerId) => {
            if (!Array.isArray(arr)) return 0; // return 0 if arr is not an array
            return arr.filter((item) => item.playerId === playerId).length;
          };

          const buildPlayerPoints = (
            selectedTeamSheet,
            // matchSubs,
            // matchTeam,
            selectedGoalscorers,
            selectedAssists,
            selectedYellows,
            selectedReds,
            cleanSheet,
          ) => {
            return selectedTeamSheet.map((player) => {
              const playerId = player.value;

              const goalsCount = countOccurrences(
                selectedGoalscorers,
                playerId,
              );
              const assistsCount = countOccurrences(selectedAssists, playerId);
              const yellowsCount = countOccurrences(selectedYellows, playerId);
              const redsCount = countOccurrences(selectedReds, playerId);

              let started = false;
              let subbedOn = false;
              let x = 0;

              if (selectedSub.some((p) => p.value === player.value)) {
                subbedOn = true;
                started = false;
                x =
                  goalsCount * SCORING.GOAL +
                  assistsCount * SCORING.ASSIST +
                  yellowsCount * SCORING.YELLOW +
                  redsCount * SCORING.RED +
                  (cleanSheet ? SCORING.CLEAN_SHEET : 0) +
                  SCORING.COMEON;
              }

              if (selectedTeamSheet.some((p) => p.value === player.value)) {
                started = true;
                subbedOn = false;
                x =
                  goalsCount * SCORING.GOAL +
                  assistsCount * SCORING.ASSIST +
                  yellowsCount * SCORING.YELLOW +
                  redsCount * SCORING.RED +
                  (cleanSheet ? SCORING.CLEAN_SHEET : 0) +
                  SCORING.STARTED;
              }

              // NEED TO PASS BOTH STRATED AND SUBBED VALUE WHEN WRITING THE DATA TO DB
              // ANDF GO BACK AND CHANGE THE PREV GW FOR PLAYERS OR REMOVE THEM AND GO AGAIN
              // AS THEY DONT HAVE THE STARTED COMEON VALUE
              // THEN NEED TO WORK ON TOTALLING PTS NOW WITH SUBS

              return {
                playerId,
                goals: goalsCount,
                assists: assistsCount,
                yellows: yellowsCount,
                reds: redsCount,
                cleanSheet: cleanSheet,
                gwPoints: x,
                started: started,
                subbedOn: subbedOn,
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
          );

          console.log("Player Points Data:", playerPoints);
          handleAddPts(playerPoints);
          handleNextTeam(allPts);

          // Usage:
          handleAddPts(playerPoints, (updatedPts) => {
            handleNextTeam(updatedPts);
          });

          try {
            const token2 = await auth.currentUser.getIdToken();
            const res2 = await fetch(
              `${getApiBase()}/api/results/updatePlayerPoints`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token2}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  playerData: playerPoints,
                  gw: currentGW,
                }),
              },
            );
            const data2 = await res2.json();
            if (data2.success) {
              // alert("Player points and Fixtures updated successfully!");
              handleNextTeam();
            }
          } catch (error) {
            console.error("Error updating player points:", error);
          }
        }
      } catch (error) {
        console.error("Error updating fixture score: ", error);
      }
    }
  };

  const handleAddPts = (playerPoints, callback) => {
    setAllPts((prev) => {
      const newPts = [...prev, ...playerPoints];
      if (callback) callback(newPts); // run callback with updated array
      return newPts; // update state
    });
  };

  // sorts out the loop thru all teams in the club for results
  const handleNextTeam = async (allPts) => {
    if (currentDataTeamIndex < team) {
      // clear data stored in all values
      setHomeGoals(0);
      setAwayGoals(0);
      setUserClubGoals(0);
      setSelectedSquad(currentDataTeamIndex + 1);
      setSelectedGoalscorers([]);
      setSelectedAssists([]);
      setSelectedYellows([]);
      setSelectedReds([]);
      setSelectedTeamSheet(null);
      setSelectedGK([]);
      setSelectedDef([]);
      setSelectedMid([]);
      setSelectedFwd([]);
      setSelectedSub([]);
      setTemp(false);
      // this must be last thing we do
      setCurrentDataTeamIndex(currentDataTeamIndex + 1);
    } else {
      try {
        // HAVE TO DUPLICATE ALL TEAMS FOR ALL USERS INTO CURRENTGW+1 SO THEY HAVE TEAM FOR NEXT WEEK
        const token3 = await auth.currentUser.getIdToken();
        const res3 = await fetch(
          `${getApiBase()}/api/results/updateTEAMpoints`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token3}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              users: allUsers,
              gw: currentGW,
              points: allPts,
            }),
          },
        );
        const data3 = await res3.json();
        if (data3.success) {
          try {
            const token4 = await auth.currentUser.getIdToken();
            const res4 = await fetch(
              `${getApiBase()}/api/results/updateAllGW`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token4}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  users: allUsers,
                  gw: currentGW,
                }),
              },
            );
            const data4 = await res4.json();
            if (data4) {
              // alert("GW updated and Team Points updated !");
              console.log("All teams Done");

              setUser((prevUser) => ({
                ...prevUser,
                currentGW: Number(prevUser.currentGW) + 1,
              }));

              navigate("/admin");
            } else {
              console.log("NO");
            }
          } catch (error) {
            console.log("Error updating gw : ", error);
          }
        } else {
          // console.log("NO");
        }
      } catch (error) {
        console.log("Error adding gw points: ", error);
      }
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

          <div className="resultsRow">
            <form className="teamsheetForm" onSubmit={handleSubmit}>
              <div className="formRow">
                <label> Goalkeeper : </label>
                {gkOptions && (
                  <Select
                    name="gk"
                    className="multiSelect"
                    options={gkOptions}
                    value={selectedGK || []}
                    onChange={(selected) => {
                      setSelectedGK(selected);
                    }}
                  />
                )}
              </div>

              <div className="formRow">
                <label> Defender : </label>
                {defOptions && (
                  <Select
                    isMulti
                    name="def"
                    className="multiSelect"
                    options={defOptions}
                    value={selectedDef || []}
                    onChange={(selected) => {
                      setSelectedDef(selected);
                    }}
                  />
                )}
              </div>

              <div className="formRow">
                <label> Midfielder : </label>
                {midOptions && (
                  <Select
                    isMulti
                    name="mid"
                    className="multiSelect"
                    options={midOptions}
                    value={selectedMid || []}
                    onChange={(selected) => {
                      setSelectedMid(selected);
                    }}
                  />
                )}
              </div>

              <div className="formRow">
                <label> Forward : </label>
                {fwdOptions && (
                  <Select
                    isMulti
                    name="fwd"
                    className="multiSelect"
                    options={fwdOptions}
                    value={selectedFwd}
                    onChange={(selected) => {
                      setSelectedFwd(selected);
                    }}
                  />
                )}
              </div>

              <div className="formRow">
                <label> Used Subs : </label>
                {subOpts && (
                  <Select
                    isMulti
                    name="sub"
                    className="multiSelect"
                    options={subOpts}
                    value={selectedSub}
                    isOptionDisabled={() => selectedSub.length >= 2}
                    onChange={(selected) => {
                      setSelectedSub(selected);
                    }}
                  />
                )}
              </div>

              <div className="formRow">
                <button
                  type="submit"
                  className="submitButton"
                  // disabled={
                  //   selectedGK.length +
                  //     selectedDef.length +
                  //     selectedMid.length +
                  //     selectedFwd.length !==
                  //   8

                  //   // selectedGK.length +
                  //   //   selectedDef.length +
                  //   //   selectedMid.length +
                  //   //   selectedFwd.length !==
                  //   // 11
                  // }
                >
                  Save Team Sheet
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {temp && (
        <div className="statsRow">
          <h4>Match Stats</h4>
          <form className="matchDetailsForm" onSubmit={handleSubmitMatchStats}>
            <fieldset disabled={!selectedTeamSheet}>
              <div className="formRow" id="goalsRow">
                {homeTeam === userClub && (
                  <>
                    {/* our goals */}
                    <label>{homeTeam} Goals:</label>
                    <input
                      type="number"
                      min="0"
                      value={userClubGoals}
                      onChange={(e) => {
                        setUserClubGoals(Number(e.target.value));
                        setHomeGoals(Number(e.target.value));
                        setSelectedGoalscorers([]);
                        setSelectedAssists([]);
                      }}
                    />
                    <label>{awayTeam} Goals:</label>
                    <input
                      type="number"
                      min="0"
                      value={awayGoals}
                      onChange={(e) => {
                        setAwayGoals(Number(e.target.value));
                      }}
                    />
                  </>
                )}

                {awayTeam === userClub && (
                  <>
                    <label>{homeTeam} Goals:</label>
                    <input
                      type="number"
                      min="0"
                      value={homeGoals}
                      onChange={(e) => {
                        setHomeGoals(Number(e.target.value));
                      }}
                    />
                    {/* our goals if away */}
                    <label>{awayTeam} Goals:</label>
                    <input
                      type="number"
                      min="0"
                      value={userClubGoals}
                      onChange={(e) => {
                        setUserClubGoals(Number(e.target.value));
                        setAwayGoals(Number(e.target.value));
                        setSelectedGoalscorers([]);
                        setSelectedAssists([]);
                      }}
                    />
                  </>
                )}
              </div>

              <div className="formRow">
                <label> Goalscorers: </label>
                <Select
                  isMulti
                  name="goalscorers"
                  className="multiSelect"
                  options={goalsOptions}
                  isDisabled={!selectedTeamSheet || userClubGoals === 0}
                  value={selectedGoalscorers || []}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={handleDuplicateScorer}
                />
              </div>

              <div className="formRow">
                <label> Assists: </label>
                <Select
                  isMulti
                  name="assists"
                  className="multiSelect"
                  options={assistOptions}
                  isDisabled={!selectedTeamSheet || userClubGoals === 0}
                  value={selectedAssists || []}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={handleDuplicateAssist}
                />
              </div>

              <div className="formRow">
                <label> Yellows: </label>
                <Select
                  isMulti
                  name="yellows"
                  className="multiSelect"
                  options={yellowOptions}
                  isDisabled={!selectedTeamSheet}
                  value={selectedYellows || []}
                  onChange={(selected) => setSelectedYellows(selected)}
                />
              </div>

              <div className="formRow">
                <label> Reds: </label>
                <Select
                  isMulti
                  name="reds"
                  className="multiSelect"
                  options={redOptions}
                  isDisabled={!selectedTeamSheet}
                  value={selectedReds || []}
                  onChange={(selected) => setSelectedReds(selected)}
                />
              </div>

              {/* <div className="formRow">
                <label> Pen Saves: </label>
                only want data from saved teamsheet
                <Select
                // name="penSaves"
                // className="multiSelect"
                // options={selectedGK}
                // isDisabled={!selectedTeamSheet}
                // value={selectedPenSaves || []}
                // onChange={(selected) => setSelectedPenSaves(selected)}
                />
              </div> */}

              <div className="formRow">
                <button
                  type="submit"
                  className="submitButton"
                  // disabled={
                  //   selectedGK.length === 0 ||
                  //   selectedDef.length === 0 ||
                  //   selectedMid.length === 0 ||
                  //   selectedFwd.length === 0
                  //   // selectedDef.length === 0
                  // }
                >
                  Save Match Stats
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
