import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext.js";
import { PlayerProvider } from "./context/PlayerContext.js";
import { TeamProvider } from "./context/TeamContext.js";
import { FixtureProvider } from "./context/FixtureContext.js";
import { ClubProvider } from "./context/ClubContext.js";
import LoginPage from "./pages/LoginPage";
import AdminHomePage from "./pages/AdminHomePage/AdminHomePage";
import AddPlayersPage from "./pages/AddPlayersPage/AddPlayersPage";
import ResultsPage from "./pages/ResultsPage/ResultsPage";
import TeamPage from "./pages/TeamPage/TeamPage.js";
import CreateTeamPage from "./pages/TeamPage/CreateTeamPage.js";

function App() {
  return (
    <PlayerProvider>
      <UserProvider>
        <TeamProvider>
          <FixtureProvider>
            <ClubProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminHomePage />} />
                  <Route path="/Players" element={<AddPlayersPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="CreateTeam" element={<CreateTeamPage />} />
                </Routes>
              </Router>
            </ClubProvider>
          </FixtureProvider>
        </TeamProvider>
      </UserProvider>
    </PlayerProvider>
  );
}

export default App;
