import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { addResult } from "../config/firestore.js";
import { updateGW } from "../config/firestore.js";
import { addGWPoints } from "../config/firestore.js";

const router = express.Router();

router.post("/api/results/updateScore", authenticateToken, async (req, res) => {
  try {
    const homeScore = req.body.homeScore;
    const awayScore = req.body.awayScore;
    const userClub = req.body.club;
    const squad = `${req.body.squad}s`;
    const gw = `gw${req.body.gw}`;

    const result = await addResult(homeScore, awayScore, userClub, squad, gw);
    if (result) {
      res.status(200).json({ message: "success", success: true });
    } else {
      res.status(500).json({ error: "Failed to add player", success: false });
    }
  } catch (error) {
    console.error("Error adding player:", error);
    res.status(500).json({ error: "Failed to add player" });
  }
});

router.post(
  "/api/results/updateCurrentGW",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const newGW = req.body.newGW;

      const result = await updateGW(userId, newGW);
      if (result) {
        res.status(200).json({ message: "success", success: true });
      } else {
        res
          .status(500)
          .json({ error: "Failed to update current GW", success: false });
      }
    } catch (error) {
      console.error("Error updating current GW:", error);
      res.status(500).json({ error: "Failed to update current GW" });
    }
  },
);

router.post(
  "/api/results/updatePlayerPoints",
  authenticateToken,
  async (req, res) => {
    try {
      const playerData = req.body.playerData;
      const gw = req.body.gw;
      // console.log(playerData);
      const result = await addGWPoints(playerData, gw);
      if (result) {
        res.status(200).json({ message: "success", success: true });
      } else {
        res
          .status(500)
          .json({ error: "Failed to update points", success: false });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update points", success: false });
    }
  },
);

export default router;
