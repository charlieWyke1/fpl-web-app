import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { addPlayer } from "../config/firestore.js";

const router = express.Router();

router.post("/api/players/addPlayer", authenticateToken, async (req, res) => {
  try {
    // const name = req.query.name;
    const name = req.body.name;
    const club = req.body.club;
    const position = req.body.position;
    const cost = req.body.cost;
    const totalPoints = 0;
    const team = req.body.team;

    // console.log(name, club, position, cost);

    const result = await addPlayer(
      name,
      cost,
      position,
      club,
      totalPoints,
      team
    );
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
export default router;
