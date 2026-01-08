import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";

import { useUser } from "../../context/UserContext.js";
import { useClub } from "../../context/ClubContext.js";
import { useCurrentTeam } from "../../context/CurrentTeamContext.js";

import { useNavigate } from "react-router-dom";

import { useCurrentGWTeam } from "../../hooks/useCurrentTeam.js";

import { SetStartingTeamValues } from "../../utils/SetStartingTeamValues.js";

import NavBar from "../NavBar.js";
import ShirtSvg from "../../svgFolder/ShirtSVG.js";

import "./FirstTeamPage.css";
import "./CreateTeamPage.js";
import "../../themes/clubThemes.css";

function FirstTeamPage() {
  const { user } = useUser();
  const { clubData, setClubData } = useClub();
  const { setCurrentTeam, currentTeam } = useCurrentTeam();

  const navigate = useNavigate();
  const userClub = user?.club;

  const [team, setTeam] = useState(false);

  // GK swapping
  const [activeGk, setActiveGk] = useState(null);
  const [activeSubGkIndex, setActiveSubGkIndex] = useState(null);

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

  // this is only for GW1 or when the user needs to choose their initial team
  // will need a new page for when they go to their "original page / team"
  useCurrentGWTeam(user.id, user.currentGW);
  // HOOK FOR TESTING GETTING GW1 TEAM WONT NEED WHEN USER GOES STAROIGHT FORM BUILDING TEAM TO SELECTING TEAM
  // as then we just use the team set in context no need to go and grab it from the database - plus that started causing errors
  // so this works as a workaround - comment out when done testing creating team
  const { def, mid, fwd } = SetStartingTeamValues(clubData);
  const [selectedSubs, setSelectedSubs] = useState([]);

  // this gets our team split back up into position so we can display the current team
  // clubData stores the numb players etc.. about our club atm
  const allGk = currentTeam.filter((p) => p.position === "GK");
  const allDef = currentTeam.filter((p) => p.position === "DEF");
  const allMid = currentTeam.filter((p) => p.position === "MID");
  const allFwd = currentTeam.filter((p) => p.position === "FWD");

  const [selectedGk, setSelectedGk] = useState(null);
  const [selectedDef, setSelectedDef] = useState(Array(def).fill(null));
  const [selectedMid, setSelectedMid] = useState(Array(mid).fill(null));
  const [selectedFwd, setSelectedFwd] = useState(Array(fwd).fill(null));

  // console.log(clubData);
  // console.log(clubData.squadNumber - clubData.startingTeamNumber);

  useEffect(() => {
    if (!currentTeam.length) return;

    const starters = [
      allGk[0],
      ...allDef.slice(0, def),
      ...allMid.slice(0, mid),
      ...allFwd.slice(0, fwd),
    ].filter(Boolean);

    setSelectedGk(allGk[0] ?? null);
    setSelectedDef(allDef.slice(0, def));
    setSelectedMid(allMid.slice(0, mid));
    setSelectedFwd(allFwd.slice(0, fwd));

    const subs = currentTeam.filter((player) => !starters.includes(player));

    setSelectedSubs(subs);
  }, [currentTeam, def, mid, fwd]);

  if (!team) return null;

  // TO DO :
  // need to make the option for people to be able to swap and change between subs and starters
  // when we save the team - need to update database with boolean values for all users for starting true or false so we can easily make the team for main team page

  // set up for goalkeeper swapping
  const handleStarterGkClick = () => {
    if (activeGk === selectedGk) {
      setActiveGk(null);
    } else {
      setActiveGk(selectedGk);
    }
    // checks if the other gk has been clicked for swapping
    if (activeSubGkIndex !== null) {
      swapGks(activeSubGkIndex);
    }
  };
  const handleSubGkClick = (index) => {
    if (activeSubGkIndex === index) {
      setActiveSubGkIndex(null);
    } else {
      setActiveSubGkIndex(index);
    }
    // checks if the other gk has been clicked for swapping
    if (activeGk) {
      swapGks(index);
    }
  };
  // swaps our gks round in the lists and on display
  const swapGks = (subIndex) => {
    const newSubs = [...selectedSubs];
    const subGk = newSubs[subIndex];

    // Swap starter GK into sub list
    newSubs[subIndex] = selectedGk;

    setSelectedGk(subGk);
    setSelectedSubs(newSubs);

    setActiveGk(null);
    setActiveSubGkIndex(null);
  };

  // GK swapping done

  return (
    <div className={themeClass}>
      <NavBar />

      <div className="topRow">
        <div className="teamName">
          <h4>{user.teamName}</h4>
        </div>
        <div className="gameweek">
          <h4>Gameweek: {user.currentGW}</h4>
        </div>
      </div>

      <div className="selectedTeamContainer">
        <div className="penalty-box top"></div>
        <div className="six-yard-box top"></div>
        <div className="penalty-arc top"></div>
        <div className="halfway-line"></div>

        <div className="gkRow">
          <div className="shirtRow">
            {selectedGk && (
              <div className="shirtContainer">
                <button
                  className={`shirtButton gkButton ${
                    activeGk === selectedGk ? "activeGK" : ""
                  }`}
                  onClick={handleStarterGkClick}
                >
                  <ShirtSvg className={`gkShirt ${themeClass}`} size={120} />
                </button>

                <div className="nameTag">
                  <p>{selectedGk.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="defRow">
          <div className="shirtRow">
            {Array.from({ length: def }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={120} />
                </button>

                <div className="nameTag">
                  {selectedDef[index] && (
                    <>
                      <p>{selectedDef[index].name}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="midRow">
          <div className="shirtRow">
            {Array.from({ length: mid }).map((_, index) => (
              <div key={index} className="shirtContainer">
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={120} />
                </button>

                <div className="nameTag">
                  {selectedMid[index] && (
                    <>
                      <p>{selectedMid[index].name}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fwdRow">
          <div className="shirtRow">
            {Array.from({ length: fwd }).map((_, index) => (
              <div key={index} className="shirtContainer">
                {/* <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={120} />
                </button> */}
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={120} />
                </button>

                <div className="nameTag">
                  {selectedFwd[index] && (
                    <>
                      <p>{selectedFwd[index].name}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="subRow">
        <div className="shirtRow">
          {selectedSubs.map((sub, index) => (
            <div key={index} className="shirtContainer">
              {sub.position === "GK" ? (
                <button
                  className={`shirtButton gkButton ${
                    activeSubGkIndex === index ? "activeSubGK" : ""
                  }`}
                  onClick={() => handleSubGkClick(index)}
                >
                  <ShirtSvg className={`gkShirt ${themeClass}`} size={100} />
                </button>
              ) : (
                <button className="shirtButton">
                  <ShirtSvg className={`shirt ${themeClass}`} size={100} />
                </button>
              )}

              <div className="nameTag">
                <p>{sub.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="saveFirstTeamButton">Save Starting Team</button>
    </div>
  );
}

export default FirstTeamPage;
