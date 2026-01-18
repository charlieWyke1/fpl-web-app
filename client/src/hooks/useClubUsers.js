// src/hooks/useClubUsers.js
import { useState, useEffect } from "react";
import { auth } from "../config/firebase.js";
import { useUser } from "../context/UserContext.js";
import { useAllClub } from "../context/AllClubUsersContext.js";

import { getApiBase } from "../config/api.js";

export const useClubUsers = (user) => {
  const { users, setUser } = useUser();
  const { setAllUsers } = useAllClub();
  const [club, setClub] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${getApiBase()}/api/admin/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        const adminClub = user?.club || "default";

        // filter by club
        const filteredData = data.filter(
          (u) => u.club?.toLowerCase() === adminClub.toLowerCase()
        );

        setAllUsers(filteredData);

        // sort by score descending
        const sortData = filteredData.sort((a, b) => b.score - a.score);

        setClub(adminClub);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setTimeout(() => setLoadingUsers(false), 800);
      }
    };

    fetchUsers();
  }, []);

  return { users, club, loadingUsers };
};
