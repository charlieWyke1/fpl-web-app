import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useAllTeam } from "../../context/AllTeamsContext.js";
import { useFixture } from "../../context/FixtureContext.js";
import { useClub } from "../../context/ClubContext.js";

import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";
import TeamModal from "./TeamModal.js";

import "./MatchesPage.css";
import "../../themes/clubThemes.css";

function MatchesPage() {
  const { user } = useUser();
  const { fixtures } = useFixture();
  const { players } = usePlayers();

  const [changeGwFixtures, setChangeGwFixtures] = useState(
    `gw${user?.currentGW}`,
  );

  const [gwFixtureList, setGwFixtureList] = useState([]);
  const [gwTeam, setGwTeam] = useState({});
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [gameData, setGameData] = useState();

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  const nextGwFixtures = () => {
    const number = parseInt(changeGwFixtures.slice(2), 10);
    const lastGwKey = Object.keys(fixtures)
      .map((key) => ({ key, num: Number(key.replace("gw", "")) })) // extract number
      .sort((a, b) => b.num - a.num)[0].key; // take the one with highest number

    if (lastGwKey === changeGwFixtures) {
      return;
    } else {
      setChangeGwFixtures("gw" + (number + 1));
    }
    setChangeGwFixtures("gw" + (number + 1));
  };

  const prevGwFixtures = () => {
    const number = parseInt(changeGwFixtures.slice(2), 10);
    if (number === 1) {
      setChangeGwFixtures("gw1");
      return;
    }
    setChangeGwFixtures("gw" + (number - 1));
  };

  useEffect(() => {
    const gwFixtures = fixtures?.[changeGwFixtures];
    if (!gwFixtures) return;

    const formattedFixtures = Object.entries(gwFixtures).map(
      ([key, gwFixture]) => {
        const date = new Date(gwFixture.kickOff._seconds * 1000);

        return {
          id: key,
          homeTeam: gwFixture.home.club,
          homeScore: gwFixture.home.score,
          homeSquad: gwFixture.home.squad,
          awayTeam: gwFixture.away.club,
          awayScore: gwFixture.away.score,
          awaySquad: gwFixture.away.squad,
          status: gwFixture.status,
          kickOff: date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      },
    );

    setGwFixtureList(formattedFixtures);

    const number = parseInt(changeGwFixtures.slice(2), 10);
    const teams = Object.values(players).reduce((acc, player) => {
      const teamNumber = player.team;
      const scored = player.gameweeks?.[number]?.goals ?? 0;
      const assist = player.gameweeks?.[number]?.assists ?? 0;
      const started = player.gameweeks?.[number]?.started ?? 0;

      if (!acc[teamNumber]) {
        acc[teamNumber] = {
          gwTeam: [],
          gwScorers: [],
          gwAssists: [],
        };
      }

      if (started) {
        acc[teamNumber].gwTeam.push(player);
      }

      if (scored > 0) {
        acc[teamNumber].gwScorers.push({
          player,
          goals: scored,
        });
      }

      if (assist > 0) {
        acc[teamNumber].gwAssists.push({
          player,
          assists: assist,
        });
      }
      return acc;
    }, {});

    setGwTeam(teams);
  }, [changeGwFixtures, fixtures]);

  const openTeamModal = (fixture) => {
    if (fixture.homeTeam === userClub) {
      setSelectedSquad(fixture.homeSquad);
    } else {
      setSelectedSquad(fixture.awaySquad);
    }
    setTeamModalOpen(true);
    setGameData(fixture);
    console.log(fixture);
  };

  const closeTeamModal = () => {
    setSelectedSquad(null);
    setTeamModalOpen(false);
  };

  // console.log(players);
  // console.log(clubData.numbTeams);
  // console.log(gwTeam);

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRow2">
        <button onClick={prevGwFixtures}>&larr;</button>

        <h4>{changeGwFixtures.toLocaleUpperCase()}</h4>

        <button onClick={nextGwFixtures}>&rarr;</button>
      </div>

      {/* 
      {/* JUST GOT CSS TO DO */}
      {gwFixtureList.map((fixture) => (
        <div key={fixture.id} className="fixtureCard">
          <div className="kickOffDate">
            <h3>{fixture.kickOff}</h3>
          </div>

          {/* if game played */}
          {fixture.status && (
            <>
              <div className="results">
                <div
                  className="clickForTeam"
                  onClick={() => openTeamModal(fixture)}
                >
                  <h4>
                    {fixture.homeTeam} ({fixture.homeSquad}s){" "}
                    <b>
                      {fixture.homeScore} - {fixture.awayScore}
                    </b>{" "}
                    {fixture.awayTeam} ({fixture.awaySquad}
                    s)
                  </h4>
                </div>

                <div className="goalScorers">
                  {fixture.homeTeam === userClub &&
                    gwTeam[fixture.homeSquad].gwScorers.length > 0 && (
                      <h5>
                        <b>⚽︎ - </b>
                        {gwTeam[fixture.homeSquad].gwScorers
                          .map(
                            (scorerObj) =>
                              `${scorerObj.player.name} x${scorerObj.goals}`,
                          )
                          .join(", ")}
                      </h5>
                    )}
                  {fixture.awayTeam === userClub &&
                    gwTeam[fixture.awaySquad].gwScorers.length > 0 && (
                      <h5>
                        <b>⚽︎ - </b>
                        {gwTeam[fixture.awaySquad].gwScorers
                          .map(
                            (scorerObj) =>
                              `${scorerObj.player.name} x${scorerObj.goals}`,
                          )
                          .join(", ")}
                      </h5>
                    )}
                </div>

                <div className="assistMakers">
                  {fixture.homeTeam === userClub &&
                    gwTeam[fixture.homeSquad].gwAssists.length > 0 && (
                      <h5>
                        <b>👟 - </b>
                        {gwTeam[fixture.awaySquad].gwAssists
                          .map(
                            (assistObj) =>
                              `${assistObj.player.name} x${assistObj.assists}`,
                          )
                          .join(", ")}
                      </h5>
                    )}
                  {fixture.awayTeam === userClub &&
                    gwTeam[fixture.awaySquad].gwAssists.length > 0 && (
                      <h5>
                        <b>👟 - </b>
                        {gwTeam[fixture.awaySquad].gwAssists
                          .map(
                            (assistObj) =>
                              `${assistObj.player.name} x${assistObj.assists}`,
                          )
                          .join(", ")}
                      </h5>
                    )}
                </div>
              </div>
            </>
          )}

          {!fixture.status && (
            <>
              <div className="notPlayed">
                <h4>
                  {fixture.homeTeam} ({fixture.homeSquad}s) vs{" "}
                  {fixture.awayTeam} ({fixture.awaySquad}
                  s)
                </h4>
              </div>
            </>
          )}
        </div>
      ))}

      {teamModalOpen && changeGwFixtures && (
        <TeamModal
          squad={selectedSquad}
          fixtureDetails={gwTeam[selectedSquad]}
          fixtureGw={changeGwFixtures}
          game={gameData}
          onClose={closeTeamModal}
        />
      )}
    </div>
  );
}

export default MatchesPage;
