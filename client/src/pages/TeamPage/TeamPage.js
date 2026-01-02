import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";

import { useNavigate } from "react-router-dom";

import { useCurrentGWTeam } from "../../hooks/useCurrentTeam.js";

import NavBar from "../NavBar.js";

import "./TeamPage.css";
import "../../themes/clubThemes.css";

function TeamPage() {
  const { user } = useUser();
  const { clubData, setClubData } = useClub();

  const navigate = useNavigate();
  const userClub = user?.club;

  const [team, setTeam] = useState(false);

  const themeClass = userClub
    ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
    : "theme-default";

  // GET OUR CLUB DATA TO HELP SET UP SQUAD SIZE AND STUFF
  useEffect(() => {
    if (!user) return;

    const fetchClubData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `http://localhost:5000/api/team/getClubData?club=${user.club}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        // console.log(data);
        setClubData(data);
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchClubData();
  }, []);

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
        } else {
          setTeam(true);
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

  // console.log(user);

  // if the currentGW is 1 we send 1 otherwsie we send gw-1
  // this way if it is gw4 we get the team from gw3 let the user edit it and then save it as GW4

  useCurrentGWTeam(user.id, user.currentGW);
  console.log(clubData);

  if (!team) return null;

  return (
    <div className={themeClass}>
      <NavBar />
      <p> {user.teamName} </p>
      <p> current gw points </p>
      <p> total points </p>
    </div>
  );
}

export default TeamPage;
