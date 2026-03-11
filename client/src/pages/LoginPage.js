import React from "react";
import { useState, useEffect } from "react";

import { auth } from "../services/firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.js";
import { getApiBase } from "../config/api.js";

import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [allClubs, setAllClubs] = useState([]);

  // stores our email and password values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newUserClicked, setNewUserClicked] = useState(false);
  const [role, setRole] = useState();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminClub, setAdminClub] = useState("");
  const [adminClubNumber, setAdminClubNumber] = useState(0);
  const [adminGkColour, setAdminGkColour] = useState("");
  const [adminPlayerColour, setAdminPlayerColour] = useState("");

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/admin/getAllClubs`);
        const data = await response.json();
        setAllClubs(data);
      } catch (error) {
        console.log("Error getting clubs", error);
      }
    };

    fetchClubs();
  }, []);

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
        console.log(data.user);
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

  const formInvalid =
    adminPassword === "" ||
    adminConfirmPassword === "" ||
    adminEmail === "" ||
    adminClub === "" ||
    adminGkColour === "" ||
    adminPlayerColour === "" ||
    adminClubNumber === 0 ||
    adminConfirmPassword !== adminPassword;

  const adminSubmit = async (e) => {
    // right now need to sign the user up as an admin using firebase
    e.preventDefault();

    if (adminPassword.length < 7) {
      alert("Password not long enough");
      return;
    }

    try {
      const userCreds = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword,
      );
      const user = userCreds.user;
      const userId = user.uid;
      // this creates our user in the authentication part ^^
      // now to save them to user in database
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${getApiBase()}/api/admin/saveAdmin`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            club: adminClub,
            numbTeams: adminClubNumber,
            gkShirt: adminGkColour,
            playerShirt: adminPlayerColour,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setUser({
            admin: true,
            id: userId,
            club: adminClub,
            currentGw: 1,
          });
          navigate("/admin");
        }
      } catch (error) {
        console.log("Error creating Admin");
      }
    } catch (error) {
      console.log("Error: ", error.message);
    }
  };

  return (
    <>
      <div className="loginBox">
        {!newUserClicked && (
          <>
            <div className="box" id="right">
              <form className="loginForm" onSubmit={handleSubmit}>
                <label
                  htmlFor="inputEmail"
                  className="form-label"
                  id="emailLabel"
                >
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

                <p onClick={() => setNewUserClicked((prev) => !prev)}>
                  New here? Sign up !
                </p>
              </form>
            </div>
          </>
        )}

        {newUserClicked && (
          <>
            <div className="box" id="newUserBox">
              <div className="roleCheckboxes">
                <label>
                  <input
                    type="radio"
                    name="role"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                  />
                  {"  "}
                  Admin
                </label>

                <label>
                  <input
                    type="radio"
                    name="role"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                  />
                  {"  "}
                  User
                </label>
              </div>

              <div className="roleContent">
                {role === "admin" && (
                  <div className="adminFormSignUp">
                    <form className="adminForm" onSubmit={adminSubmit}>
                      <label htmlFor="adminEmail">Email</label>
                      <input
                        type="email"
                        id="adminEmail"
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />

                      <label htmlFor="adminPassword">Password</label>
                      <input
                        type="password"
                        id="adminPassword"
                        className="form-control"
                        onChange={(e) => setAdminPassword(e.target.value)}
                        value={adminPassword}
                        required
                      />

                      <label htmlFor="adminConfirmPassword">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="adminConfirmPassword"
                        className={`form-control ${
                          adminConfirmPassword
                            ? adminPassword === adminConfirmPassword
                              ? "is-valid"
                              : "is-invalid"
                            : ""
                        }`}
                        onChange={(e) =>
                          setAdminConfirmPassword(e.target.value)
                        }
                        value={adminConfirmPassword}
                        required
                      />

                      <label htmlFor="adminClub">Club</label>
                      <input
                        type="text"
                        id="adminClub"
                        onChange={(e) => setAdminClub(e.target.value)}
                        required
                      />

                      <label htmlFor="adminClubSize">Teams in Club</label>
                      <input
                        type="number"
                        id="adminClubSize"
                        min="1"
                        onChange={(e) =>
                          setAdminClubNumber(Number(e.target.value))
                        }
                        required
                      />

                      <label htmlFor="colourForGkInput">Gk Kit Colour</label>
                      <input
                        id="colourForGkInput"
                        defaultValue="#F54927"
                        type="color"
                        onChange={(e) => setAdminGkColour(e.target.value)}
                        required
                      />

                      <label htmlFor="colourForPlayerInput">
                        Player Kit Colour
                      </label>
                      <input
                        id="colourForPlayerInput"
                        defaultValue="#F5B427"
                        type="color"
                        onChange={(e) => setAdminPlayerColour(e.target.value)}
                        required
                      />

                      <button
                        type="submit"
                        className="adminButton"
                        disabled={formInvalid}
                      >
                        Save Admin
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {role === "user" && (
                <>
                  <h4> all clubs stores all our clubs for club choice</h4>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default LoginPage;
