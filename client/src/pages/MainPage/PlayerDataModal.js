import { useEffect, useState } from "react";

import { useUser } from "../../context/UserContext.js";

import "./PlayerDataModal.css";
import "../../themes/clubThemes.css";
import "../../utils/Pitch.css";

const PlayerModal = ({ isOpen, onClose, player }) => {
  const { user } = useUser();

  const [selectedGW, setSelectedGw] = useState("");

  const userClub = user?.club;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const handleChange = (e) => {
    const gw = e.target.value;
    setSelectedGw(gw);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedGw("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  //   console.log(player.gameweeks[gw]);

  let totalGoals = 0;
  let totalAssists = 0;
  let totalCleanSheets = 0;
  let totalYellows = 0;
  let totalReds = 0;
  let totalPenSaves = 0;
  let totalStarts = 0;
  let totalSubbed = 0;

  for (const gw in player.gameweeks) {
    const week = player.gameweeks[gw];
    const pos = player.position;

    if (pos === "GK") {
      totalGoals += week.goals || 0;
      totalAssists += week.assists || 0;
      totalCleanSheets += week.cleanSheet || 0;
      totalPenSaves += week.penSave || 0;
      totalYellows += week.yellows || 0;
      if (week.started) {
        totalStarts += 1;
      } else {
        totalStarts += 0;
      }
      if (week.subbedOn) {
        totalSubbed += 1;
      } else {
        totalSubbed += 0;
      }
      if (week.redCard) {
        totalReds += 1;
      } else {
        totalReds += 0;
      }
    } else if (pos === "DEF") {
      totalGoals += week.goals || 0;
      totalAssists += week.assists || 0;
      totalCleanSheets += week.cleanSheet || 0;
      totalYellows += week.yellows || 0;
      totalStarts += week.starts || 0;
      if (week.started) {
        totalStarts += 1;
      } else {
        totalStarts += 0;
      }
      if (week.subbedOn) {
        totalSubbed += 1;
      } else {
        totalSubbed += 0;
      }
      if (week.redCard) {
        totalReds += 1;
      } else {
        totalReds += 0;
      }
    } else if (pos === "MID") {
      totalGoals += week.goals || 0;
      totalAssists += week.assists || 0;
      totalCleanSheets += week.cleanSheet || 0;
      totalYellows += week.yellows || 0;
      totalStarts += week.started || 0;
      if (week.started) {
        totalStarts += 1;
      } else {
        totalStarts += 0;
      }
      if (week.subbedOn) {
        totalSubbed += 1;
      } else {
        totalSubbed += 0;
      }
      if (week.redCard) {
        totalReds += 1;
      } else {
        totalReds += 0;
      }
    } else if (pos === "FWD") {
      totalGoals += week.goals || 0;
      totalAssists += week.assists || 0;
      totalYellows += week.yellows || 0;
      totalStarts += week.starts || 0;
      if (week.started) {
        totalStarts += 1;
      } else {
        totalStarts += 0;
      }
      if (week.subbedOn) {
        totalSubbed += 1;
      } else {
        totalSubbed += 0;
      }
      if (week.redCard) {
        totalReds += 1;
      } else {
        totalReds += 0;
      }
    }
  }

  return (
    <div className="modalOverlayHomePage" onClick={onClose}>
      <div
        className={`modalContainerHomePage ${themeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeaderHomePage">
          <button onClick={onClose}>X</button>
          <h2>{player?.name}</h2>
          <div className="modalHeaderRow">
            <h3>{player?.position}</h3>
            <h3>£{player?.cost}m</h3>
            <h3>{player?.totalPoints} pts</h3>
          </div>
        </div>

        <div className="modalBodyHomePage">
          <div className="modalCol">
            <div className="modalRow">
              <select
                className="gameweekFilter"
                value={selectedGW}
                onChange={handleChange}
              >
                <option value="" className="gameWeekOpt" disabled>
                  Select Gameweek
                </option>
                {Object.keys(player.gameweeks).map((gw) => (
                  <option key={gw} value={gw} className="gameWeekOpt">
                    Gameweek {gw}
                  </option>
                ))}
              </select>

              <table className="gwStatsTable">
                <tbody>
                  {selectedGW && (
                    <>
                      <tr>
                        <td>Goals:</td>
                        <td>{player.gameweeks[selectedGW].goals || 0}</td>
                        <td>
                          {(player.gameweeks[selectedGW].goals || 0) * 7} pts
                        </td>
                      </tr>
                      <tr>
                        <td>Assists:</td>
                        <td>{player.gameweeks[selectedGW].assists || 0}</td>
                        <td>
                          {(player.gameweeks[selectedGW].assists || 0) * 5} pts
                        </td>
                      </tr>

                      {/* {player.position === "GK" && (
                        <tr>
                          <td>Clean Sheet:</td>
                          <td>
                            {player.gameweeks[selectedGW].cleanSheetGK ? 1 : 0}
                          </td>
                          <td>
                            {(player.gameweeks[selectedGW].cleanSheetGK
                              ? 1
                              : 0) * 5}{" "}
                            pts
                          </td>
                        </tr>
                      )}
                      {player.position === "DEF" && (
                        <tr>
                          <td>Clean Sheet:</td>
                          <td>
                            {player.gameweeks[selectedGW].cleanSheetDEF ? 1 : 0}
                          </td>
                          <td>
                            {(player.gameweeks[selectedGW].cleanSheetDEF
                              ? 1
                              : 0) * 5}{" "}
                            pts
                          </td>
                        </tr>
                      )}
                      {player.position === "MID" && (
                        <tr>
                          <td>Clean Sheet:</td>
                          <td>
                            {player.gameweeks[selectedGW].cleanSheetMID
                              ? "Yes"
                              : "No"}
                          </td>
                          <td>
                            {(player.gameweeks[selectedGW].cleanSheetMID
                              ? 1
                              : 0) * 2}{" "}
                            pts
                          </td>
                        </tr>
                      )} */}

                      <tr>
                        <td>Clean Sheet:</td>
                        <td>
                          {player.gameweeks[selectedGW].cleanSheet
                            ? "Yes"
                            : "No"}
                        </td>
                        <td>
                          {(player.gameweeks[selectedGW].cleanSheet ? 1 : 0) *
                            4}{" "}
                          pts
                        </td>
                      </tr>

                      <tr>
                        <td>Yellow Cards:</td>
                        <td>{player.gameweeks[selectedGW].yellows || 0}</td>
                        <td>
                          {(player.gameweeks[selectedGW].yellows || 0) * -2} pts
                        </td>
                      </tr>
                      <tr>
                        <td>Red Cards:</td>
                        <td>{player.gameweeks[selectedGW].redCard || 0}</td>
                        <td>
                          {(player.gameweeks[selectedGW].redCard || 0) * -4} pts
                        </td>
                      </tr>
                      <tr>
                        <td>Started:</td>
                        <td>
                          {player.gameweeks[selectedGW]?.started ? "Yes" : "No"}
                        </td>
                        <td>
                          {(player.gameweeks[selectedGW]?.started ? 1 : 0) * 2}{" "}
                          pts
                        </td>
                      </tr>
                      <tr>
                        <td>Subbed On:</td>
                        <td>
                          {player.gameweeks[selectedGW]?.subbedOn
                            ? "Yes"
                            : "No"}
                        </td>
                        <td>
                          {(player.gameweeks[selectedGW]?.subbedOn ? 1 : 0) * 1}{" "}
                          pts
                        </td>
                      </tr>

                      {player.position === "GK" && (
                        <tr>
                          <td>Pen Saves:</td>
                          <td>{player.gameweeks[selectedGW].penSave || 0}</td>
                          <td>
                            {(player.gameweeks[selectedGW].penSave || 0) * 7}{" "}
                            pts
                          </td>
                        </tr>
                      )}

                      <tr style={{ fontWeight: "bold" }}>
                        <td>Total:</td>
                        <td></td>
                        <td>
                          {player.gameweeks[selectedGW].gwPoints || 0} pts
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEASON SIDE */}
          <div className="modalCol">
            <h3>Season Stats</h3>
            <table className="HomePageModalTotalTable">
              <tbody>
                <tr>
                  <td>Goals:</td>
                  <td>{totalGoals}</td>
                  <td>{totalGoals * 7} pts</td>
                </tr>
                <tr>
                  <td>Assists:</td>
                  <td>{totalAssists}</td>
                  <td>{totalAssists * 5} pts</td>
                </tr>

                {/* {(player.position === "GK" || player.position === "DEF") && (
                  <tr>
                    <td>Clean Sheets:</td>
                    <td>{totalCleanSheets}</td>
                    <td>{totalCleanSheets * 5} pts</td>
                  </tr>
                )}

                {player.position === "MID" && (
                  <tr>
                    <td>Clean Sheets:</td>
                    <td>{totalCleanSheets}</td>
                    <td>{totalCleanSheets * 2} pts</td>
                  </tr>
                )} */}

                <tr>
                  <td>Clean Sheets:</td>
                  <td>{totalCleanSheets}</td>
                  {player.position === "GK" && (
                    <td>{totalCleanSheets * 5} pts</td>
                  )}
                  {player.position === "DEF" && (
                    <td>{totalCleanSheets * 4} pts</td>
                  )}
                  {player.position === "MID" && (
                    <td>{totalCleanSheets * 2} pts</td>
                  )}
                  {player.position === "FWD" && (
                    <td>{totalCleanSheets * 0} pts</td>
                  )}
                </tr>

                <tr>
                  <td>Yellow Cards:</td>
                  <td>{totalYellows}</td>
                  <td>{totalYellows * -2} pts</td>
                </tr>
                <tr>
                  <td>Red Cards:</td>
                  <td>{totalReds}</td>
                  <td>{totalReds * -4} pts</td>
                </tr>
                <tr>
                  <td>Starts:</td>
                  <td>{totalStarts}</td>
                  <td>{totalStarts * 2} pts</td>
                </tr>
                <tr>
                  <td>Subbed On:</td>
                  <td>{totalSubbed}</td>
                  <td>{totalSubbed * 1} pts</td>
                </tr>

                {player.position === "GK" && (
                  <tr>
                    <td>Penalty Saves:</td>
                    <td>{totalPenSaves}</td>
                    <td>{totalPenSaves * 7} pts</td>
                  </tr>
                )}
                <tr style={{ fontWeight: "bold" }}>
                  <td>Total:</td>
                  <td></td>
                  <td>{player.totalPoints || 0} pts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
