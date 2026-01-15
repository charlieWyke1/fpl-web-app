import { useState, useEffect } from "react";
import { auth } from "../config/firebase.js";
import { useFixture } from "../context/FixtureContext.js";

import { getApiBase } from "../config/api.js";


export const useFixtures = (user) => {
  const { fixtures, setFixtures } = useFixture();
  const [loadingFixtures, setLoadingFixtures] = useState(true);

  useEffect(() => {
    if (!user) return;

    const club = user?.club;

    const fetchFixtures = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${getApiBase()}/api/admin/fixtures?club=${club}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch fixtures");

        const data = await res.json();
        setFixtures(data);
      } catch (error) {
        console.error("Error fetching fixtures:", error);
      } finally {
        setTimeout(() => setLoadingFixtures(false), 800);
      }
    };

    fetchFixtures();
  }, []);

  return { fixtures };
};
