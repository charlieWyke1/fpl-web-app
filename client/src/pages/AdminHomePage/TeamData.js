import { useEffect, useState } from "react";
import { auth } from "../../config/firebase.js";

import { getApiBase } from "../../config/api.js";

export default function useTeamData(isOpen, user) {
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const userId = user.id;
    const currentGW = user.currentGW;

    const fetchTeamData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${getApiBase()}/api/admin/team?userId=${userId}&currentGW=${currentGW}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch team data");

        const data = await res.json();

        setTeamData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTeamData();
  }, []);
}
