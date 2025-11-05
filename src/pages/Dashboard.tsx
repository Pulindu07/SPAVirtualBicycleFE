import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapViewGoogleMaps as MapView } from "../components/MapViewGoogleMaps";
import { StatsCard } from "../components/StatsCard";
import { useUserProgress } from "../hooks/useUserProgress";
import { useRouteData } from "../hooks/useRouteData";
import { api } from "../api/client";
import "./Dashboard.css";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const {
    progress,
    loading: progressLoading,
    error: progressError,
    refetch,
  } = useUserProgress(userId);
  const { routePoints, routeLength, loading: routeLoading } = useRouteData();

  useEffect(() => {
    // Get userId from URL or localStorage
    const userIdFromUrl = searchParams.get("userId");
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromUrl) {
      localStorage.setItem("userId", userIdFromUrl);
      setUserId(parseInt(userIdFromUrl));
      // Clean up URL
      navigate("/dashboard", { replace: true });
    } else if (userIdFromStorage) {
      setUserId(parseInt(userIdFromStorage));
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  const handleSync = async () => {
    if (!userId) return;

    try {
      setSyncing(true);
      await api.syncUserActivities(userId);
      await refetch();
      alert("Activities synced successfully!");
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync activities. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (km: number): string => {
    return km.toFixed(2);
  };

  if (progressLoading || routeLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p>Error loading progress data</p>
          <button onClick={() => navigate("/")}>Back to Login</button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚴 Virtual Sri Lanka Ride</h1>
          <div className="header-actions">
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-section">
          <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>
            Welcome,{" "}
            {progress.firstName && progress.lastName
              ? `${progress.firstName} ${progress.lastName}`
              : progress.username}
            ! 👋
          </h2>
          <div className="stats-grid">
            <StatsCard
              title="Distance Covered"
              value={`${formatDistance(progress.totalDistanceKm)} km`}
              icon="📏"
              color="#667eea"
            />
            <StatsCard
              title="Remaining Distance"
              value={`${formatDistance(
                routeLength - progress.totalDistanceKm
              )} km`}
              icon="🗺️"
              color="#38B2AC"
            />
            <StatsCard
              title="Total Time"
              value={formatTime(progress.totalMovingTimeSec)}
              icon="⏱️"
              color="#f093fb"
            />
            <StatsCard
              title="Progress"
              value={`${progress.progressPercent.toFixed(1)}%`}
              icon="📊"
              color="#4facfe"
            />
            <StatsCard
              title="Route Length"
              value={`${routeLength.toFixed(0)} km`}
              icon="🏝️"
              color="#43e97b"
            />
          </div>
          <p className="last-sync">
            Last synced: {new Date(progress.lastSync).toLocaleString()}
          </p>
        </div>

        <div className="map-section">
          <h2>Your Virtual Location</h2>
          <MapView
            routePoints={routePoints}
            progressPercent={progress.progressPercent}
            coveredDistanceKm={progress.totalDistanceKm}
          />
        </div>
      </div>
    </div>
  );
};
