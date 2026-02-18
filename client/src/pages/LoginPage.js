import React from "react";
import "./LoginPage.css";

import { auth } from "../services/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.js";
import { getApiBase } from "../config/api.js";

function LoginPage() {
  // stores our email and password values
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // sends firebase our email and password for login
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const token = await user.getIdToken();
      // console.log("Logged in with token:", token);

      // now we check if that email/ password combo is valid on our server and we request a token
      // sends it over to our server code - index.js which uses our authMiddleware to check if token is valid
      const response = await fetch(`${getApiBase()}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.admin) {
          // console.log("admin");
          navigate("/admin");
        } else {
          // navigate to normal user homepage
          navigate("/HomePage");
        }
      } else {
        alert("Failed to login - please try again.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        alert("Incorrect login details - please try again.");
      } else {
        console.error("Error during login:", error);
      }
    }
  };

  return (
    // <div className="container-fluid" id="loginBox">
    //   <form className="loginForm" onSubmit={handleSubmit}>
    //     <div className="mb-3">
    //       <label htmlFor="inputEmail" className="form-label" id="emailLabel">
    //         Email:
    //       </label>
    //       <input
    //         type="email"
    //         className="form-control"
    //         id="inputEmail"
    //         onChange={(e) => setEmail(e.target.value)}
    //         required
    //       />
    //     </div>
    //     <div className="mb-3">
    //       <label
    //         htmlFor="inputPassword"
    //         className="form-label"
    //         id="passwordLabel"
    //       >
    //         Password:
    //       </label>
    //       <input
    //         type="password"
    //         className="form-control"
    //         id="inputPassword"
    //         onChange={(e) => setPassword(e.target.value)}
    //         required
    //       />
    //     </div>

    //     <button
    //       type="submit"
    //       className="btn btn-primary"
    //       id="loginButton"
    //       disabled={!email || !password}
    //     >
    //       Log In
    //     </button>
    //   </form>
    // </div>
    <div className="loginBox">
      <div className="box" id="left">
        <h5>Welcome to Club Fantsay Football</h5>
        <h5>
          Play the popular game but this time with the club and players you play
          with every week!
        </h5>
      </div>
      <div className="box" id="right">
        <form className="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="inputEmail" className="form-label" id="emailLabel">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="inputEmail"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label
            htmlFor="inputPassword"
            className="form-label"
            id="passwordLabel"
          >
            Password:
          </label>
          <input
            type="password"
            className="form-control"
            id="inputPassword"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="loginButton"
            disabled={!email || !password}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
