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
        password
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
        // to go to a new webpage - we make use of React Router

        setUser(data.user);
        if (data.user.admin) {
          // console.log("admin");
          navigate("/admin");
        } else {
          // navigate to normal user homepage
          navigate("/team");
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
    <div className="container-fluid" id="loginBox">
      <form className="loginForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="inputEmail" className="form-label" id="emailLabel">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="inputEmail"
            // aria-describedby="emailHelp"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
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
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="loginButton"
          disabled={!email || !password}
          // onClick={() => {
          //   console.log(email, password);
          // }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
