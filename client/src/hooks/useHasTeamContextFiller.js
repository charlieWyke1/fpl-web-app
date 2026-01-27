// src/hooks/useHasTeamContextFiller.js
import { useEffect } from "react";

import { auth } from "../config/firebase.js";
import { getApiBase } from "../config/api.js";

import { useCurrentTeam } from "../context/CurrentTeamContext.js";
import { useClub } from "../context/ClubContext.js";
import { useAllTeam } from "../context/AllTeamsContext.js";

export const useHasTeamContextFiller = (user, refetchPlayers) => {
  const { setCurrentTeam } = useCurrentTeam();
  const { setClubData } = useClub();
  const { setAllTeam } = useAllTeam();

  const userClub = user?.club;
  const gw = user?.currentGW;

  useEffect(() => {
    if (!user || !userClub) return;

    const fetchClubData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${getApiBase()}/api/team/getClubData?club=${userClub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch club data");

        const data = await res.json();
        setClubData(data);

        if (refetchPlayers) {
          refetchPlayers();
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchClubData();
  }, [user, userClub, setClubData, refetchPlayers]);

  // fill the current TEAM section
  // just needs userid and currentGw
  useEffect(() => {
    if (!user || !userClub) return;

    const getTeam = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${getApiBase()}/api/team/getTeam`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!res.ok) throw new Error("Failed to fetch team data");

        const data = await res.json();

        const currentGw = `gw${user.currentGW}`;

        setAllTeam(data);

        refetchPlayers?.();

      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    getTeam();
  }, [user?.id, userClub, user?.currentGW, refetchPlayers]);
};
