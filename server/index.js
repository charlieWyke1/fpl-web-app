import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.js";
import addPlayerRoutes from "./routes/addPlayers.js";
import resultsRoutes from "./routes/results.js";
import teamRoutes from "./routes/team.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(adminRoutes);
app.use(addPlayerRoutes);
app.use(resultsRoutes);
app.use(teamRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
