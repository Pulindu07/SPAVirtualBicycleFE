import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import "./LoginPage.css";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleStravaLogin = () => {
    window.location.href = api.getStravaLoginUrl();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚴 Virtual Sri Lanka Ride Tracker</h1>
          <p className="subtitle">
            Track your cycling journey around the beautiful coast of Sri Lanka
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error === "access_denied" && "Authentication was cancelled"}
            {error === "authentication_failed" &&
              "Authentication failed. Please try again"}
          </div>
        )}

        <div className="login-content">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📍</span>
              <span>Visualize your progress on a map</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track your distance and time</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>Auto-sync with Strava every 2 hours</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏝️</span>
              <span>Explore Sri Lanka's 1,585 km coastal route</span>
            </div>
          </div>

          <button className="strava-login-btn" onClick={handleStravaLogin}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Connect with Strava
          </button>

          <p className="privacy-note">
            We only access your cycling activities. Your data is secure and
            private.
          </p>
        </div>
      </div>
    </div>
  );
};
