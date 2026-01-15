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
  const { team } = useTeam();
  const { fixtures } = useFixture();
  const [selectedSquad, setSelectedSquad] = useState("");

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
      (s) => s.playerId === last.playerId
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
      (s) => s.playerId === last.playerId
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
            }
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
        cleanSheet
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
        cleanSheet
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
          }
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

  // console.log(user.id);

  return (
    <div className={themeClass}>
      <NavBar />
      {/* okay this is gonna be hardest part yet */}
      <div className="headerCol">
        <div className="topRow">
          <div className="selectTop">
            <select
              className="teamSelect"
              value={selectedSquad}
              onChange={(e) => {
                handleSquadChange(e);
                setSelectedTeamSheet(null);
              }}
            >
              <option value="" disabled>
                Select Team
              </option>
              {Array.from({ length: team }, (_, i) => (
                <option key={i + 1} value={`${i + 1}s`}>
                  {i + 1}'s
                </option>
              ))}
            </select>
          </div>
          <div className="nextFixture">
            {selectedSquad && (
              <>
                {gwFixture == null ? (
                  <h4>
                    No Fixture Found for GW{currentGW} for the {selectedSquad}
                  </h4>
                ) : (
                  <h4>
                    GW{currentGW} - {gwFixture?.home?.club} vs{" "}
                    {gwFixture?.away?.club}{" "}
                  </h4>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedSquad && gwFixture && (
        <div className="resultsRow">
          <h4>
            Team Sheet for Game Week {currentGW} - {selectedSquad}
          </h4>

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
                    // console.log(selectedGK.length);
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
                    // console.log(selectedDef.length);
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
                    // console.log(
                    //   selectedMid.length +
                    //     selectedFwd.length +
                    //     selectedDef.length +
                    //   selectedGK.length
                    // );
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
                    // console.log(selectedFwd.length);
                  }}
                />
              )}
            </div>

            {/* <div className="formRow">
              <label> Used Subs : </label>
              {fwdOptions && ( // sub
                <Select
                  isMulti
                  name="sub"
                  className="multiSelect"
                  options={subOptions}
                  value={selectedSubs}
                  onChange={(selected) => setSelectedSubs(selected)}
                />
              )}
            </div> */}

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
      )}

      {selectedTeamSheet && (
        <div className="statsRow">
          <h4>Match stats for GW{currentGW}</h4>
          <form className="matchDetailsForm" onSubmit={handleSubmitMatchStats}>
            <fieldset disabled={!selectedTeamSheet}>
              <div className="formRow" id="goalsRow">
                {gwFixture?.home?.club === userClub && (
                  <>
                    {/* our goals */}
                    <label>{gwFixture.home.club} Goals:</label>
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
                    <label>{gwFixture.away.club} Goals:</label>
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

                {gwFixture?.away?.club === userClub && (
                  <>
                    <label>{gwFixture.home.club} Goals:</label>
                    <input
                      type="number"
                      min="0"
                      value={homeGoals}
                      onChange={(e) => {
                        setHomeGoals(Number(e.target.value));
                      }}
                    />
                    {/* our goals if away */}
                    <label>{gwFixture.away.club} Goals:</label>
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
                  // closeMenuOnSelect={false}
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
                  options={selectedTeamSheet}
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
                  options={selectedTeamSheet}
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
                  Save Team Sheet
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
