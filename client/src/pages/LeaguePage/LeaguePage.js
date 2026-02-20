import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useAllClub } from "../../context/AllClubUsersContext.js";

import { getApiBase } from "../../config/api.js";

import NavBar from "../NavBar.js";
import "../../themes/clubThemes.css";

import "./LeaguePage.css";

function LeaguePage() {
  const { user } = useUser();
  const { allUsers } = useAllClub();

  const [allUID, setAllUID] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [leagueData, setLeagueData] = useState([]);

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  useEffect(() => {
    // get the ids of all users and populate list
    const allIds = allUsers.map((user) => user.id);

    const managerName = allUsers.map((x) => ({
      name: x.name,
      id: x.id,
    }));
    console.log(allUsers);
    console.log(allIds);
    console.log(managerName);

    setAllUID(allIds);
    getAllTeams(allIds, managerName);
  }, [allUsers]);

  const getAllTeams = async (ids, managerName) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${getApiBase()}/api/leagues/getALLteams`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allUserIds: ids }),
      });

      const teams = await res.json();

      const token2 = await auth.currentUser.getIdToken();
      const res2 = await fetch(`${getApiBase()}/api/leagues/getTeamNames`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token2}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allUserIds: ids }),
      });

      const teamNames = await res2.json();

      if (teams.success && teamNames.success) {
        joinTeamNames(teams, teamNames, managerName);
      } else {
        console.log("uh oh");
      }
    } catch (error) {
      console.error("Error finding the teams: ", error);
    }
  };

  const joinTeamNames = (teams, teamNames, managerName) => {
    const teams2 = teams.allTeams;
    const teamNames2 = teamNames.allTeamNames;

    const nameLookUp = Object.fromEntries(teamNames2.map((n) => [n.id, n]));
    const managerLookUp = Object.fromEntries(managerName.map((x) => [x.id, x]));
    const merged = teams2.map((team) => ({
      ...team,
      ...nameLookUp[team.id],
      ...managerLookUp[team.id],
    }));

    setMergedData(merged);
  };

  useEffect(() => {
    if (!mergedData || mergedData.length === 0) return;

    let number = parseInt(currentGW.slice(2), 10);
    if (number === 1) return;
    number = number - 1;
    const gwKey = "gw" + number;

    const leagueArr = mergedData.map((team) => {
      const totalPts = Object.values(team.gameweeks).reduce((acc, gw) => {
        if (!gw.locked) return acc;

        const gwPoints = gw.team.reduce((sum, player) => {
          if (player?.isStarting) return sum + (Number(player.gwPoints) || 0);
          return sum;
        }, 0);

        const minus = Number(gw.minusPoints) || 0;

        return acc + gwPoints + minus;
      }, 0);

      const prevGWData = team.gameweeks?.[gwKey];
      let gwPts = 0;
      if (prevGWData) {
        gwPts =
          prevGWData.team.reduce((sum, player) => {
            if (player?.isStarting) return sum + (Number(player.gwPoints) || 0);
            return sum;
          }, 0) + (Number(prevGWData.minusPoints) || 0);
      }

      return {
        teamName: team.teamName,
        managerName: team.name,
        totalPts,
        gwPts,
      };
    });

    const sortedLeague = [...leagueArr].sort((a, b) => b.totalPts - a.totalPts);

    setLeagueData(sortedLeague);
    // test()
  }, [mergedData]);

  const test = () => {
    console.log(leagueData);
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRow">
        <h4>{userClub} League Table</h4>
      </div>

      <div className="leagueTableDiv">
        <table className="leagueTable">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Manager</th>
              <th>GW Points</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leagueData.map((team, index) => (
              <tr key={team.id}>
                <td>{index + 1}</td>
                <td>{team.teamName}</td>
                <td>{team.managerName}</td>
                <td>{team.gwPts}</td>
                <td>{team.totalPts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaguePage;
