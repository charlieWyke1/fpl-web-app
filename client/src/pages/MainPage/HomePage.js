import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

import { useNavigate } from "react-router-dom";

import { useFixtures } from "../../hooks/useFixtures.js";

import { getApiBase } from "../../config/api.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";
import Countdown from "../../utils/Countdown.js";

import "./HomePage.css"
import "../../themes/clubThemes.css";



function HomePage() {
  const { user } = useUser();
  const { currentTeam } = useCurrentTeam();
  
  const navigate = useNavigate();
  const [team, setTeam] = useState(false);

  const userClub = user?.club;
  const currentGW = `gw${user?.currentGW}`;


  const themeClass = userClub
  ? `theme-${userClub.toLowerCase().replace(/\s+/g, "-")}`
  : "theme-default";

  // now we shld probs check if the user has a team here 
  // if no team goes to create team 
  // if there is a team we can move on
  useEffect(() => {
      if (!user) return;
  
      const checkTeam = async () => {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch(
            `${getApiBase()}/api/team/checkTeamExistence`,
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

    // everything from here only works if we HAVE a team

    const fixturesTemp = useFixtures(user);
    const tsDate = fixturesTemp.fixtures.cutOff[currentGW]
    const cutOffDate = new Date(tsDate._seconds * 1000);
    
    // const cutOffDay = date.toLocaleDateString("en-gb", {
    //   weekday : "long",
    //   day : "numeric",
    //   month : "long",
    // })

    // const cutOffTime = date.toLocaleTimeString("en-GB", {
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
    


  return (
    <div className = {themeClass}>
      <NavBar />

      <div className="topRow">
        <div className="teamRow">
          <div className="teamName">
            <h4>{user.teamName}</h4>
          </div>
          <div className="ptsShow">
            <div className="gwPoints">
              <h5>58pts</h5>
            </div>
            <div className="totalPoints">
              <h4>100pts</h4>
            </div>
          </div>
        </div>
        
        

      </div>

      <Countdown targetDate={cutOffDate} />

    </div>
  );
}

export default HomePage;
