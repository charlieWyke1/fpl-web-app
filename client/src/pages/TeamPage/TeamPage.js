import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext.js";
import { auth } from "../../config/firebase.js";
import { useNavigate } from "react-router-dom";

import NavBar from "../NavBar.js";

import "./TeamPage.css";
import "../../themes/clubThemes.css";

function TeamPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const userClub = user?.club;

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // check if a user has a team created yet - if not, redirect to create team page
  useEffect(() => {
    if (!user) return;

    const checkTeam = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          "http://localhost:5000/api/team/checkTeamExistence",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        const data = await res.json();

        if (data.exists === false) {
          //   navigate to create team page
          navigate("/CreateTeam");
        }
      } catch (error) {
        console.error("Error checking team existence:", error);
      }
    };

    checkTeam();
  }, []);

  // need to load in the all the data about the users team
  // load in the users currentGW and then fetch the relevant team data for that gw
  // to make the first team we load in allgk all def allmid allfwd and depending on starting size we build the team
  // give user option for who they want to be in their starting team and save it and update with chosen boolean on database

  // once saved we display the team and give them options above the team to go to transfers or view prev points
  // diplay goes team name - points this gw - overall points
  // then displays the option for transfers -  pick team - view prev points
  // then display starting in formation with subs below
  // then displays the leagues and ranks the user is in

  console.log(user);

  return (
    <div className={themeClass}>
      <NavBar />
      <p> </p>
    </div>
  );
}

export default TeamPage;
