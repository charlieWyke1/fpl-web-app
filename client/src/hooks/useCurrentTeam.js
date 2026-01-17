// src/hooks/usePlayers.js
import { useState, useEffect, useCallback } from "react";
import { auth } from "../config/firebase.js";
import { useCurrentTeam } from "../context/CurrentTeamContext.js";

import { getApiBase } from "../config/api.js";


// this will get the users current team based on the CURRENT GW
// used for viewing current team, choosing who is to play and transfers

export const useCurrentGWTeam = (user, currentGW, skip=false) => {
  const { setCurrentTeam } = useCurrentTeam();
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    if (!user || !currentGW || skip) {
      setLoadingTeam(false);
      return;
    };

    const fetchCurrentGWTeam = async () => {
      try {
        setLoadingTeam(true);

        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${getApiBase()}/api/team/getCurrentGWTeam`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id ?? user.uid,
            currentGW,
          }),
        });

        const data = await res.json();
        setCurrentTeam(data.team || []); 
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchCurrentGWTeam();
  }, [user, currentGW, skip]); 

  return { loadingTeam };
};


