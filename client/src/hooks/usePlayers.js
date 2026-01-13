// src/hooks/usePlayers.js
import { useState, useEffect, useCallback } from "react";
import { auth } from "../config/firebase.js";
import { usePlayer } from "../context/PlayerContext.js";

export const usePlayers = (user) => {
  const { players, setPlayers } = usePlayer();
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Reusable fetch function — can be called manually OR by useEffect
  const fetchPlayers = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingPlayers(true);

      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5001/api/admin/players", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch players");

      const data = await res.json();
      const club = user?.club;

      const filteredPlayers = data.filter(
        (player) => player.club?.toLowerCase() === club.toLowerCase()
      );

      const sortedPlayers = filteredPlayers.sort(
        (a, b) => b.totalPoints - a.totalPoints
      );

      setPlayers(sortedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setTimeout(() => setLoadingPlayers(false), 800);
    }
  }, [user, setPlayers]);

  // Run once on mount
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loadingPlayers,
    refetchPlayers: fetchPlayers,
  };
};
