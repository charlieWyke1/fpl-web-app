import React from "react";
import "./LoginPage.css";

import { auth } from "../services/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.js";
import { getApiBase } from "../config/api.js";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  // stores our email and password values
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [newUserClicked, setNewUserClicked] = React.useState(false);
  const [role, setRole] = React.useState();

  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = React.useState("");
  const [adminClub, setAdminClub] = React.useState("");
  const [adminGkColour, setAdminGkColour] = React.useState("");
  const [adminPlayerColour, setAdminPlayerColour] = React.useState("");

  const newUser = () => {
    console.log(newUserClicked);
  };

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

  const formInvalid =
    adminPassword === "" ||
    adminConfirmPassword === "" ||
    adminEmail === "" ||
    adminClub === "" ||
    adminGkColour === "" ||
    adminPlayerColour === "" ||
    adminConfirmPassword !== adminPassword;

  const adminSubmit = async () => {
    // right now need to sign the user up as an admin using firebase
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

                <p
                  onClick={() => (
                    setNewUserClicked((prev) => !prev),
                    newUser()
                  )}
                >
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

                      <label htmlFor="adminColour">Gk Kit Colour</label>
                      <input
                        id="colourForClubInput"
                        value="#F54927"
                        type="color"
                        onChange={(e) => setAdminGkColour(e.target.value)}
                        required
                      />

                      <label htmlFor="adminColour">Player Kit Colour</label>
                      <input
                        id="colourForClubInput"
                        value="#F5B427"
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

              {/* {role === "user" && (
              <>
                <h4>USER</h4>
              </>
            )} */}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default LoginPage;
