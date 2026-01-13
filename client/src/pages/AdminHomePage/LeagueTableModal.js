import React from "react";
import { useEffect, useState, useMemo } from "react";
import { auth } from "../../config/firebase.js";
import useTeamData from "./TeamData.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";

import "./LeagueTableModal.css";

export default function LeagueTableModal({ isOpen, onClose, user, players }) {
  // if (!isOpen) return null;
  // IN FUTURE  change so we store team data in a custom hook and just call that here
  // so we can cache all gameweeks at once rather than fetching each time we open the modal

  // change display to fit the team of 11 with gk at bottom
  const [teamData, setTeamData] = useState(null);
  const [team, setTeam] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setSelectedGW(1);
    }
  }, [isOpen]);

  const maxGW = user?.currentGW ?? 1;

  const gameweeks = Array.from({ length: maxGW }, (_, i) => i + 1);

  const [selectedGW, setSelectedGW] = useState(maxGW);

  const playersById = useMemo(() => {
    if (!players || players.length === 0) return {};
    return players.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [players]);

  const themeClass = user?.club
    ? `theme-${user.club.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // console.log(user);

  useEffect(() => {
    if (!isOpen) return;

    const userId = user.id;

    const fetchTeamData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `http://localhost:5001/api/admin/team?userId=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch team data");
        const data = await res.json();

        setTeamData(data);
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };
    fetchTeamData();
  }, [isOpen, user]);

  const selectedGwTeam = useMemo(() => {
    if (!teamData) return null;

    const teamDataForGW = teamData.find((t) => Number(t.gw) === selectedGW);
    if (!teamDataForGW) return null;

    const teamWithPlayerData = {};
    for (const pos in teamDataForGW) {
      if (pos === "gw") continue;
      const playerId = teamDataForGW[pos];
      teamWithPlayerData[pos] = playersById[playerId] || null;
    }
    console.log(teamWithPlayerData);
    return teamWithPlayerData;
  }, [teamData, selectedGW, playersById]);

  if (!isOpen) return null;

  return (
    <div className="modalOverlap" onClick={onClose}>
      <div className="modalContainerTeam" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeaderTeam">
          <h2 className="teamTitle">{user?.teamName}</h2>
          <div className="modalHeaderRowTeam">
            <h4>
              {user.firstName} {user.secondName}
            </h4>
            <h4>Total Pts : {user.score}</h4>
            <select
              className="gwSelect"
              value={selectedGW}
              onChange={(e) => setSelectedGW(Number(e.target.value))}
            >
              {gameweeks.map((gw) => (
                <option key={gw} value={gw}>
                  GW{gw}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="teamView">
          <div className="goalKeeperView">
            <ShirtSvg className={`shirt ${themeClass}`} size={50} />
            <p> {selectedGwTeam?.GK?.name} </p>
            <p>
              {" "}
              {selectedGwTeam?.GK?.[`gameweeks`]?.[`gw${selectedGW}`]
                ?.gwPoints ?? 0}{" "}
              pts
            </p>
          </div>

          <div className="defView">
            <div className="playerCol">
              <ShirtSvg className={`shirt ${themeClass}`} size={50} />
              <p> {selectedGwTeam?.GK?.name} </p>
              <p>
                {" "}
                {selectedGwTeam?.GK?.[`gameweeks`]?.[`gw${selectedGW}`]
                  ?.gwPoints ?? 0}{" "}
                pts
              </p>
            </div>

            <div className="playerCol">
              <ShirtSvg className={`shirt ${themeClass}`} size={50} />
              <p> {selectedGwTeam?.GK?.name} </p>
              <p>
                {" "}
                {selectedGwTeam?.GK?.[`gameweeks`]?.[`gw${selectedGW}`]
                  ?.gwPoints ?? 0}{" "}
                pts
              </p>
            </div>
          </div>

          <div className="midView">
            <div className="playerCol"></div>
          </div>

          <div className="fwdView">
            <div className="playerCol"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
