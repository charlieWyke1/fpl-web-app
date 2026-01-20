import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

// context
import { useUser } from "../../context/UserContext.js";
import { useTeam } from "../../context/TeamContext.js";
import { useAllClub } from "../../context/AllClubUsersContext.js";

// hooks
import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";
import { useClubUsers } from "../../hooks/useClubUsers.js";

import { Link } from "react-router-dom";

import { getApiBase } from "../../config/api.js";

import "./AdminHomePage.css";
import "./LoadingPage.css";
import "../../themes/clubThemes.css";

import LeagueTableModal from "./LeagueTableModal.js";
import PlayerModal from "./PlayerModal.js";
import NavBar from "../NavBar.js";

function AdminHomePage() {
  const { user } = useUser();
  const { allUsers } = useAllClub();
  const userClub = user?.club;

  const { team, setTeam } = useTeam();

  const { loadingFixtures } = useFixtures(user);
  const { players, loadingPlayers } = usePlayers(user);
  const { club, loadingUsers } = useClubUsers(user); // does it automatically

  const [isLeagueTableModalOpen, setIsLeagueTableModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [filterPlayers, setFilterPlayers] = useState("all");

  // fetch how many teams our admin's club has
  useEffect(() => {
    if (!user) return;

    const fetchTeam = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${getApiBase()}/api/admin/squads?club=${user.club}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch team");
        const data = await res.json();
        setTeam(data);
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };

    fetchTeam();
  }, [user, setTeam]);

  // fetch ALL the users who are the same club as our admin
  // useEffect(() => {
  //   if (!user) return;

  //   const fetchUsers = async () => {
  //     try {
  //       const token = await auth.currentUser.getIdToken();
  //       const res = await fetch(`${getApiBase()}/api/admin/users`, {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ club: user.clubName }),
  //       });

  //       const data =  res.json;
  //       console.log(data);
  //     } catch (error) {
  //       console.error("Error fidning users : ", error);
  //     }
  //   };

  //   fetchUsers();
  // }, [user]);

  // filter players for top points table
  const filterPlayersByPosition = players
    .filter(
      (player) => filterPlayers === "all" || player.position === filterPlayers,
    )
    .slice(0, 10);

  const themeClass = club
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // modal handlers
  const openLeagueTableModal = (user) => {
    setSelectedUser(user);
    setIsLeagueTableModalOpen(true);
  };
  const closeLeagueTableModal = () => {
    setIsLeagueTableModalOpen(false);
    setSelectedUser(null);
  };

  const openPlayerModal = (player) => {
    setSelectedPlayer(player);
    setIsPlayerModalOpen(true);
  };
  const closePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedPlayer(null);
  };

  // allUsers -- THIS stores all of our users who are in the same club of the admin whos logged in
  // console.log(allUsers); -- does work for future notice

  // loading screen
  if (loadingUsers || loadingPlayers || loadingFixtures) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="row1Admin">
        <div className="buttonRows">
          <button>
            <Link to="/Players">Add New Players</Link>
          </button>
          <button>
            <Link to="/results">Enter Match Results</Link>
          </button>
        </div>
      </div>

      <div className="row2Admin">
        <div className="statsRow">
          <div className="statsBox">
            <h4> {club} </h4>
          </div>

          <div className="statsBox">
            <h4> Teams : </h4>
            <h4> 6 </h4>
          </div>

          <div className="statsBox">
            <h4> Players : </h4>
            <h4> {players.length} </h4>
          </div>

          <div className="statsBox">
            <h4> Top Manager : </h4>
            <h4> Bob Bob - 168pts</h4>
          </div>

          {/* <div className="statsBox">
            <h4> Top Points : </h4>
            <h4>
              
              {players[0].name} - {players[0].totalPoints}pts
            </h4>
          </div> */}
        </div>
      </div>

      <div className="row3Admin">
        <div className="leagueTableAdmin">
          <h5>Top Point Scorers</h5>
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

      <LeagueTableModal
        isOpen={isLeagueTableModalOpen}
        onClose={closeLeagueTableModal}
        user={selectedUser}
        players={players}
      />
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={closePlayerModal}
        player={selectedPlayer}
      />
    </div>
  );
}

export default AdminHomePage;
