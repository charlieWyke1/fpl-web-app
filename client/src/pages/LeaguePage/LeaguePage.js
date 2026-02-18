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

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // get all the users from the same club -- ALREADY DONE WITH ALLUSERS

  // get all the team data from all the users
  // get team name data from all the users
  // count up all the points of the teams from the club

  useEffect(() => {
    // get the ids of all users and populate list
    const allIds = allUsers.map((user) => user.id);
    setAllUID(allIds);
    getAllTeams(allIds);
  }, [allUsers]);

  const getAllTeams = async (ids) => {
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
        joinTeamNames(teams, teamNames);
      }
    } catch (error) {
      console.error("Error finding the teams: ", error);
    }
  };

  const joinTeamNames = (teams, teamNames) => {
    const teams2 = teams.allTeams;
    const teamNames2 = teamNames.allTeamNames;

    const nameLookUp = Object.fromEntries(teamNames2.map((n) => [n.id, n]));
    const merged = teams2.map((t) => ({ ...t, ...nameLookUp[t.id] }));
    //   OKAY nice now stores teamName and team data so we can start counting everything
  };

  return (
    <div className={themeClass}>
      <NavBar />
    </div>
  );
}

export default LeaguePage;
