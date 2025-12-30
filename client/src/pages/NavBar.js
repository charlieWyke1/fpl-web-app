import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config/firebase.js";
import { useUser } from "../context/UserContext.js";
import { usePlayers } from "../hooks/usePlayers.js";

import "./NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { refetchPlayers } = usePlayers(user);

  return (
    <div className="topBar">
      <button className="topBarButton">LOGO</button>

      {user.admin === true && (
        <button className="topBarButton" onClick={refetchPlayers}>
          <Link to="/admin"> Dashboard </Link>
        </button>
      )}
      <button className="topBarButton">
        <Link to="#"> Matches </Link>
      </button>
      <button className="topBarButton">
        <Link to="#"> Leagues </Link>
      </button>
      <button className="topBarButton">
        <Link to="/team"> Team </Link>
      </button>
      <button className="topBarButton">
        <a
          href=""
          onClick={() => {
            auth.signOut();
            navigate("/?", { replace: true });
          }}
        >
          {" "}
          Sign Out{" "}
        </a>
      </button>
    </div>
  );
}

export default NavBar;
