import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config/firebase.js";
import { useUser } from "../context/UserContext.js";
import { usePlayers } from "../hooks/usePlayers.js";

import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { refetchPlayers } = usePlayers(user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="topBar">
      {/* Hamburger */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        &#9776;
      </div>

      {/* Navigation links */}
      <div className={`navLinks ${menuOpen ? "active" : ""}`}>
        {user.admin && (
          <button>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          </button>
        )}
        <button>
          <Link to="/HomePage" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </button>
        <button>
          <Link to="#" onClick={() => setMenuOpen(false)}>
            Leagues
          </Link>
        </button>
        <button>
          {/* KEEP IT AS FIRST TEAM FOR NOW SO I DONT HAVE TO MAKE A NEW TEAM EVERY TIME BUT WHEN DONW SWITCH TO TEAM */}
          <Link to="#" onClick={() => setMenuOpen(false)}>
            Matches
          </Link>
        </button>
        <button>
          <a
            href="#"
            onClick={() => {
              auth.signOut();
              navigate("/?", { replace: true });
              setMenuOpen(false);
            }}
          >
            Sign Out
          </a>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
