import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
  userId: number | null;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

export const Navigation = ({
  userId,
  isSuperAdmin,
  onLogout,
}: NavigationProps) => {
  const location = useLocation();

  if (!userId) return null;

  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/dashboard" className="nav-logo">
          🚴 Virtual Ride Tracker
        </Link>
        <div className="nav-links">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
          <Link
            to="/challenges"
            className={
              location.pathname.startsWith("/challenges") ? "active" : ""
            }
          >
            Challenges
          </Link>
          <Link
            to="/groups"
            className={location.pathname.startsWith("/groups") ? "active" : ""}
          >
            Groups
          </Link>
          {isSuperAdmin && (
            <Link
              to="/routes"
              className={
                location.pathname.startsWith("/routes") ? "active" : ""
              }
            >
              Routes
            </Link>
          )}
          <button className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
