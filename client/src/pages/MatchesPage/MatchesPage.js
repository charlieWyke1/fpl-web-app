import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useAllTeam } from "../../context/AllTeamsContext.js";
import { useFixture } from "../../context/FixtureContext.js";

import { useFixtures } from "../../hooks/useFixtures.js";
import { usePlayers } from "../../hooks/usePlayers.js";

import NavBar from "../NavBar.js";

import "./MatchesPage.css";
import "../../themes/clubThemes.css";

function MatchesPage() {
  const { user } = useUser();
  const { fixtures } = useFixture();

  const [changeGwFixtures, setChangeGwFixtures] = useState(
    `gw${user?.currentGW}`,
  );

  const [gwFixtureList, setGwFixtureList] = useState([]);

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
      const next = "gw" + (number + 1);
    }
    setChangeGwFixtures("gw" + (number + 1));
    const next = "gw" + (number + 1);
  };

  const prevGwFixtures = () => {
    const number = parseInt(changeGwFixtures.slice(2), 10);
    if (number === 1) {
      setChangeGwFixtures("gw1");
      return;
    }
    setChangeGwFixtures("gw" + (number - 1));
    const prev = "gw" + (number - 1);
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
  }, [changeGwFixtures, fixtures]);

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
                <h4>
                  {fixture.homeTeam} ({fixture.homeSquad}s){" "}
                  <b>
                    {fixture.homeScore} - {fixture.awayScore}
                  </b>{" "}
                  {fixture.awayTeam} ({fixture.awaySquad}
                  s)
                </h4>
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
    </div>
  );
}

export default MatchesPage;
