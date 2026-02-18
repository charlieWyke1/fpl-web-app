import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

import { getAllTeams } from "../config/firestore.js";
import { getTeamNames } from "../config/firestore.js";

const router = express.Router();

router.post("/api/leagues/getALLteams", authenticateToken, async (req, res) => {
  try {
    const allIds = req.body.allUserIds;

    const allTeams = await getAllTeams(allIds);
    if (allTeams) {
      res.status(200).json({ allTeams, success: true });
    } else {
      res.status(500).json({ error: "Failed to find teams", success: false });
    }
  } catch (error) {
    console.error("Error finding teams: ", error);
    res.status(500).json({ error: "Failed to find teams" });
  }
});

router.post(
  "/api/leagues/getTeamNames",
  authenticateToken,
  async (req, res) => {
    try {
      const allIds = req.body.allUserIds;

      const allTeamNames = await getTeamNames(allIds);
      if (allTeamNames) {
        res.status(200).json({ allTeamNames, success: true });
      } else {
        res.status(500).json({ error: "Failed to find teams", success: false });
      }
    } catch (error) {
      console.error("Error finding teams: ", error);
      res.status(500).json({ error: "Failed to find teams" });
    }
  },
);

export default router;
