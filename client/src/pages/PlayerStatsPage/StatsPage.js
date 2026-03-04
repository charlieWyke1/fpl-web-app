import React from "react";
import { useState, useEffect } from "react";

import { useAllTeam } from "../../context/AllTeamsContext.js";
import { useUser } from "../../context/UserContext.js";

import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";
import PlayerDataModal from "../MainPage/PlayerDataModal.js";

import "../../utils/Pitch.css";
import "./StatsPage.css";

import "../../themes/clubThemes.css";

function StatsPage() {
  const { allTeam } = useAllTeam();
  const { user } = useUser();
  const { players } = usePlayers(user);

  const [filterPlayers, setFilterPlayers] = useState("all");
  const [playerModal, setPlayerModal] = useState(false);
  const [playerForModal, setPlayerForModal] = useState();

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

  return (
    <div className={themeClass}>
      <NavBar />
      <div className="row3Admin">
        <div className="leagueTableAdmin">
          <h3>Top Point Scorers</h3>
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
                <th>Cost</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {filterPlayersByPosition.map((player) => (
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
