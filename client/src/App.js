import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext.js";
import { PlayerProvider } from "./context/PlayerContext.js";
import { TeamProvider } from "./context/TeamContext.js";
import { FixtureProvider } from "./context/FixtureContext.js";
import { ClubProvider } from "./context/ClubContext.js";
import { CurrentTeamProvider } from "./context/CurrentTeamContext.js";
import { AllClubProvider } from "./context/AllClubUsersContext.js";
import { AllTeamProvider } from "./context/AllTeamsContext.js";

import LoginPage from "./pages/LoginPage";
import AdminHomePage from "./pages/AdminHomePage/AdminHomePage";
import AddPlayersPage from "./pages/AddPlayersPage/AddPlayersPage";
import ResultsPage from "./pages/ResultsPage/ResultsPage";
import FirstTeamPage from "./pages/TeamPage/FirstTeamPage.js";
import CreateTeamPage from "./pages/TeamPage/CreateTeamPage.js";
import HomePage from "./pages/MainPage/HomePage.js";
import SelectTeamPage from "./pages/SelectTeamPage/SelectTeamPage.js";
import TransferTeam from "./pages/TransferPage/TransferTeam.js";
import PointsHistory from "./pages/PointHistoryPage/PointsHistory.js";
import LeaguePage from "./pages/LeaguePage/LeaguePage.js";
import MatchesPage from "./pages/MatchesPage/MatchesPage.js";
import StatsPage from "./pages/PlayerStatsPage/StatsPage.js";

import ScrollToTop from "./utils/Scroll.js";

function App() {
  return (
    <CurrentTeamProvider>
      <PlayerProvider>
        <UserProvider>
          <TeamProvider>
            <FixtureProvider>
              <ClubProvider>
                <AllClubProvider>
                  <AllTeamProvider>
                    <Router>
                      <ScrollToTop />
                      <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/admin" element={<AdminHomePage />} />
                        <Route path="/Players" element={<AddPlayersPage />} />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route path="/FirstTeam" element={<FirstTeamPage />} />
                        <Route
                          path="/CreateTeam"
                          element={<CreateTeamPage />}
                        />
                        <Route path="/HomePage" element={<HomePage />} />
                        <Route
                          path="/SelectTeam"
                          element={<SelectTeamPage />}
                        />
                        <Route
                          path="/Transferteam"
                          element={<TransferTeam />}
                        />
                        <Route
                          path="/PointsHistory"
                          element={<PointsHistory />}
                        />
                        <Route path="/Leagues" element={<LeaguePage />} />
                        <Route path="/Matches" element={<MatchesPage />} />
                        <Route path="/Stats" element={<StatsPage />} />
                      </Routes>
                    </Router>
                  </AllTeamProvider>
                </AllClubProvider>
              </ClubProvider>
            </FixtureProvider>
          </TeamProvider>
        </UserProvider>
      </PlayerProvider>
    </CurrentTeamProvider>
  );
}

export default App;
