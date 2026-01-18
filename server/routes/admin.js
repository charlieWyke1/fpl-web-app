import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  getAllPlayers,
  getTeam,
  getNumbSquads,
  getFixtures,
} from "../config/firestore.js";

const router = express.Router();

router.get("/api/admin/users", authenticateToken, async (req, res) => {
  try {
    const currentUser = await getUserById(req.user.uid);
    // above does nothing
    // below gets all the users from same club as our admin
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid; // comes from authenticateToken
    const userData = await getUserById(userId);
    if (!userData) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

router.get("/api/admin/players", authenticateToken, async (req, res) => {
  try {
    const players = await getAllPlayers();
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

router.get("/api/admin/team", authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId;
    const team = await getTeam(userId);
    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

router.get("/api/admin/squads", authenticateToken, async (req, res) => {
  try {
    const club = req.query.club;
    const squadNumber = await getNumbSquads(club);
    return res.json(String(squadNumber));
  } catch (error) {
    console.error("Error adding player:", error);
    res.status(500).json({ error: "Failed to add player" });
  }
});

router.get("/api/admin/fixtures", authenticateToken, async (req, res) => {
  try {
    const club = req.query.club;
    const wholeClubFixtures = await getFixtures(club);
    return res.json(wholeClubFixtures);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});
export default router;
