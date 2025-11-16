import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { Challenges } from "./pages/Challenges";
import { ChallengeDetail } from "./pages/ChallengeDetail";
import { Groups } from "./pages/Groups";
import { RouteManagement } from "./pages/RouteManagement";
import { CreateChallenge } from "./pages/CreateChallenge";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/routes" element={<RouteManagement />} />
        <Route path="/create-challenge" element={<CreateChallenge />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
