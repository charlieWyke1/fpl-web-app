// src/hooks/usePlayers.js
import { useState, useEffect, useCallback } from "react";
import { auth } from "../config/firebase.js";
import { useCurrentTeam } from "../context/CurrentTeamContext.js";

// this will get the users current team based on the CURRENT GW
// used for viewing current team, choosing who is to play and transfers

export const useCurrentGWTeam = (userId, currentGW) => {
  const [loadingTeam, setLoadingTeam] = useState(true);
  const { setCurrentTeam } = useCurrentTeam();

  useEffect(() => {
    if (!userId || !currentGW) return;
    // console.log("here", [userId, currentGW]);

    const fetchCurrentGWTeam = async () => {
      try {
        setLoadingTeam(true);
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `http://localhost:5001/api/team/getCurrentGWTeam`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userId, currentGW: currentGW }),
          }
        );

        const data = await res.json();

        setCurrentTeam(data.team);

        // hopefully it now returns the team data and we can display the users CURRENT TEAM for the CURRENT GW
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };

    fetchCurrentGWTeam();
  }, [userId, currentGW, setCurrentTeam]);
};
