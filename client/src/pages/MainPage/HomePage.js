import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

import { useNavigate } from "react-router-dom";

import { useCurrentGWTeam } from "../../hooks/useCurrentTeam.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";

import "./HomePage.css"
import "../../themes/clubThemes.css";


function HomePage() {
  const { user } = useUser();
  const { currentTeam } = useCurrentTeam();
  
  const navigate = useNavigate();
  const [team, setTeam] = useState(false);
  const userClub = user?.club;

  const themeClass = userClub
  ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
  : "theme-default";

  console.log(currentTeam)

  // now we shld probs check if the user has a team here 
  // if no team goes to create team 
  // if there is a team we can move on
  useEffect(() => {
      if (!user) return;
  
      const checkTeam = async () => {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(
            "http://localhost:5001/api/team/checkTeamExistence",
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



  return (
    <div className = {themeClass}>
      <NavBar />

    </div>
  );
}

export default HomePage;
