import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext.js";
import { usePlayer } from "../../context/PlayerContext.js";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../config/firebase.js";
// import { collection, addDoc } from "firebase/firestore";
import NavBar from "../NavBar.js";

import "./AddPlayersPage.css";
import "../../themes/clubThemes.css";

function AddPlayersPage() {
  const { user } = useUser();
  const { players, setPlayers } = usePlayer();
  const navigate = useNavigate();
  const [filterPlayers, setFilterPlayers] = useState("all");

  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [position, setPosition] = useState("GK");
  const [cost, setCost] = useState("");
  const [team, setTeam] = useState("");

  const userClub = user?.club;
  const posOrder = {
    GK: 1,
    DEF: 2,
    MID: 3,
    FWD: 4,
  };

  const sortedPlayers = players.sort((a, b) => {
    return posOrder[a.position] - posOrder[b.position];
  });

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const filterPlayersByPosition = players
    .filter((p) => filterPlayers === "all" || p.position === filterPlayers)
    .sort((a, b) => posOrder[a.position] - posOrder[b.position]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newteam = `${team}s`;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/players/addPlayer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          club: userClub,
          position: position,
          cost: parseFloat(cost),
          team: newteam,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Player added successfully!");
        setPlayers([
          ...players,
          {
            id: Math.floor(Math.random() * 1000000000) + 1, // temp id to keep error happy
            name: name,
            club: userClub,
            position: position,
            cost: parseFloat(cost),
            totalPoints: 0,
            team: team,
          },
        ]);

        setName("");
        setClub(userClub);
        setPosition("GK");
        setCost("");
        setTeam("");
      } else {
        alert("Failed to add player. Please try again.");
      }
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="enterRow">
        <form className="addPlayerForm" onSubmit={handleSubmit}>
          <div className="enterTopRow">
            <div className="topRowForm">
              <label> Player Name: </label>
              <input
                type="text"
                name="playerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="topRowForm">
              <label> Club: </label>
              <input
                type="text"
                name="club"
                value={userClub}
                onChange={(e) => setClub(e.target.value)}
                disabled={true}
              />
            </div>
          </div>

          <div className="enterBottomRow">
            <div className="bottomRowForm">
              <label> Squad: </label>
              <input
                type="number"
                name="team"
                step="1"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />
            </div>

            <div className="bottomRowForm">
              <label> Position: </label>
              <select
                name="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="positionSelect"
              >
                <option value="GK"> Goalkeeper </option>
                <option value="DEF"> Defender </option>
                <option value="MID"> Midfielder </option>
                <option value="FWD"> Forward </option>
              </select>
            </div>

            <div className="bottomRowForm">
              <label> Cost : </label>
              <input
                type="number"
                name="cost"
                step="0.1"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

            <div className="bottomRowForm">
              <button type="submit" className="addPlayerButton">
                Add Player
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="playersTableRow">
        <h5> All Players at {userClub} </h5>
        <select
          className="positionFilter"
          value={filterPlayers}
          onChange={(e) => setFilterPlayers(e.target.value)}
        >
          <option value="all">All</option>
          <option value="GK">Goalkeepers</option>
          <option value="DEF">Defenders</option>
          <option value="MID">Midfielders</option>
          <option value="FWD">Forwards</option>
        </select>
        <table className="playersTable">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Name</th>
              <th>Cost</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {filterPlayersByPosition.map((players, index) => (
              <tr key={players.id}>
                <td>{players.position}</td>
                <td>{players.name}</td>
                <td>£{players.cost}m</td>
                <td>{players.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddPlayersPage;
