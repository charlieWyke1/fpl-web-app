import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkTeamExistence } from "../config/firestore.js";
import { getTeamData } from "../config/firestore.js";
import { saveFirstTeam } from "../config/firestore.js";
import { getCurrentGWTeam } from "../config/firestore.js";
import { saveFirstSquad } from "../config/firestore.js";
import { saveSubSwapTeam } from "../config/firestore.js";
import { saveTransfers } from "../config/firestore.js";

const router = express.Router();

router.post(
  "/api/team/checkTeamExistence",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const teamCheck = await checkTeamExistence(userId); // Assume this function checks team existence
      if (teamCheck) {
        res.status(200).json({ exists: true });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to check team existence" });
    }
  },
);

router.get("/api/team/getClubData", authenticateToken, async (req, res) => {
  try {
    const club = req.query.club;
    const teamCheck = await getTeamData(club);
    return res.json(teamCheck);
  } catch (error) {
    res.status(500).json({ error: "Failed to check team existence" });
  }
});

router.post("/api/team/saveTeam", authenticateToken, async (req, res) => {
  try {
    const userId = req.body.userId;
    const teamName = req.body.teamName;
    const team = req.body.team;
    const gw = req.body.gw;
    const budget = req.body.budget;
    // console.log(userId, teamName, players);
    const saveTeam = await saveFirstTeam(userId, teamName, team, gw, budget);
    if (saveTeam) {
      res
        .status(200)
        .json({ success: true, message: "Team saved successfully" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save team" });
  }
});

router.post(
  "/api/team/saveSubSwapTeam",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const team = req.body.team;
      const gw = req.body.gw;
      const saveTeam = await saveSubSwapTeam(userId, gw, team);
      if (saveTeam) {
        res
          .status(200)
          .json({ success: true, message: "Team saved successfully" });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save team" });
    }
  },
);

router.post("/api/team/getTeam", authenticateToken, async (req, res) => {
  try {
    const userId = req.body.userId;

    const getCurrentTeam = await getCurrentGWTeam(userId);
    return res.json(getCurrentTeam);
  } catch (error) {
    res.status(500).json({ error: "Failed to find current team" });
  }
});

router.post("/api/team/saveSquad", authenticateToken, async (req, res) => {
  try {
    const userId = req.body.userId;
    const squad = req.body.squad;
    const gw = req.body.gw;

    const saveSquad = await saveFirstSquad(userId, squad, gw);
    if (saveSquad) {
      res
        .status(200)
        .json({ success: true, message: "Squad saved succesfully" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save Gameweek squad" });
  }
});

router.post(
  "/api/team/saveTransferTeam",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const gw = req.body.gw;
      const team = req.body.team;
      const budget = req.body.budget;
      const numbTransfers = req.body.numbTransfer;

      console.log(numbTransfers);

      const saveTransfersTeam = await saveTransfers(
        userId,
        gw,
        team,
        budget,
        numbTransfers,
      );
      if (saveTransfersTeam) {
        res
          .status(200)
          .json({ success: true, message: "Squad saved succesfully" });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save new squad" });
    }
  },
);

export default router;
