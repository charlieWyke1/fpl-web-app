import React from "react";
import { useState, useEffect, useMemo } from "react";

import { useAllTeam } from "../../context/AllTeamsContext.js";
import { useUser } from "../../context/UserContext.js";

import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";
import PlayerDataModal from "../MainPage/PlayerDataModal.js";

import "../../utils/Pitch.css";
import "./StatsPage.css";

import "../../themes/clubThemes.css";

function StatsPage() {
  const { user } = useUser();
  const { players } = usePlayers(user);

  const [filterPlayers, setFilterPlayers] = useState("all");
  const [playerModal, setPlayerModal] = useState(false);
  const [playerForModal, setPlayerForModal] = useState();

  const [sortConfig, setSortConfig] = useState({
    key: null, // this is our cost, totalPts ...
    direction: "asc", // an be asc or desc for up or down
  });

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const filterPlayersByPosition = players.filter(
    (player) => filterPlayers === "all" || player.position === filterPlayers,
  );

  const openPlayerModal = (player) => {
    setPlayerModal(true);
    setPlayerForModal(player);
  };

  const closePlayerModal = () => {
    setPlayerModal(false);
    setPlayerForModal(null);
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (key === "points") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...filterPlayersByPosition].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }

    return 0;
  });

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return "";

    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // console.log(sortConfig);

  return (
    <div className={themeClass}>
      <NavBar />
      <div className="row3Admin">
        <div className="leagueTableAdmin">
          <h3> Point Scorers</h3>
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
                <th>Pos.</th>
                <th>Name</th>
                <th onClick={() => handleSort("cost")} id="costFilter">
                  Cost<span id="arrow">{getSortArrow("cost")}</span>
                </th>
                <th onClick={() => handleSort("points")} id="pointsFilter">
                  Total Points
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr key={player.id} onClick={() => openPlayerModal(player)}>
                  <td>{player.position}</td>
                  <td>{player.name}</td>
                  <td>£{player.cost}m</td>
                  <td>{player.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerDataModal
        isOpen={playerModal}
        onClose={closePlayerModal}
        player={playerForModal}
      />
    </div>
  );
}

export default StatsPage;
