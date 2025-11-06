import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapViewGoogleMaps as MapView } from "../components/MapViewGoogleMaps";
import { StatsCard } from "../components/StatsCard";
import { Navigation } from "../components/Navigation";
import { useUserProgress } from "../hooks/useUserProgress";
import { useRouteData } from "../hooks/useRouteData";
import { useChallenges } from "../hooks/useChallenges";
import { useGroups } from "../hooks/useGroups";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import "./Dashboard.css";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { isSuperAdmin } = useAuth(userId);
  const {
    progress,
    loading: progressLoading,
    error: progressError,
    refetch,
  } = useUserProgress(userId);
  const { routePoints, routeLength, loading: routeLoading } = useRouteData();
  const { challenges, loading: challengesLoading } = useChallenges(userId);
  const { groups, loading: groupsLoading } = useGroups(userId);

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
        <Navigation
          userId={userId}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="dashboard-container">
        <Navigation
          userId={userId}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
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
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <h1>🚴 Virtual Sri Lanka Ride</h1>
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
          </button>
        </div>
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
                Math.max(0, routeLength - progress.totalDistanceKm)
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

        <div className="challenges-section">
          <div className="section-header">
            <h2>Your Challenges</h2>
            <button
              className="btn-link"
              onClick={() => navigate("/challenges")}
            >
              View All →
            </button>
          </div>
          {challengesLoading ? (
            <div className="loading-text">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="empty-state">
              No challenges yet.{" "}
              <button
                className="btn-link"
                onClick={() => navigate("/challenges")}
              >
                Browse challenges
              </button>
            </div>
          ) : (
            <div className="challenges-preview">
              {challenges.slice(0, 3).map((challenge) => (
                <div
                  key={challenge.id}
                  className="challenge-preview-card"
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                >
                  <h3>{challenge.name}</h3>
                  <p>{challenge.progressPercentage.toFixed(1)}% complete</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="groups-section">
          <div className="section-header">
            <h2>Your Groups</h2>
            <button className="btn-link" onClick={() => navigate("/groups")}>
              View All →
            </button>
          </div>
          {groupsLoading ? (
            <div className="loading-text">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              No groups yet.{" "}
              <button className="btn-link" onClick={() => navigate("/groups")}>
                Browse groups
              </button>
            </div>
          ) : (
            <div className="groups-preview">
              {groups.slice(0, 3).map((group) => (
                <div
                  key={group.id}
                  className="group-preview-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <h3>{group.name}</h3>
                  <p>{group.memberCount} members</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
