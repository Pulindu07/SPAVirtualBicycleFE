import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!userId) return null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />
      )}
      <nav className="navigation">
        <div className="nav-content">
          <div className="nav-header-row">
            <Link
              to="/dashboard"
              className="nav-logo"
              onClick={closeMobileMenu}
            >
              🚴 Virtual Ride Tracker
            </Link>
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
          <div className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "active" : ""}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/challenges"
              className={
                location.pathname.startsWith("/challenges") ? "active" : ""
              }
              onClick={closeMobileMenu}
            >
              Challenges
            </Link>
            <Link
              to="/groups"
              className={
                location.pathname.startsWith("/groups") ? "active" : ""
              }
              onClick={closeMobileMenu}
            >
              Groups
            </Link>
            {isSuperAdmin && (
              <Link
                to="/routes"
                className={
                  location.pathname.startsWith("/routes") ? "active" : ""
                }
                onClick={closeMobileMenu}
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
    </>
  );
};
