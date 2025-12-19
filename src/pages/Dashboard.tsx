import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapViewGoogleMaps as MapView } from "../components/MapViewGoogleMaps";
import { StatsCard } from "../components/StatsCard";
import { Navigation } from "../components/Navigation";
import { UserGuide } from "../components/UserGuide";
import { useRouteData } from "../hooks/useRouteData";
import { useChallenges } from "../hooks/useChallenges";
import { useGroups } from "../hooks/useGroups";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import type { ChallengeProgress } from "../types";
import "./Dashboard.css";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [hasRefetched, setHasRefetched] = useState(false);

  const { isSuperAdmin } = useAuth(userId);
  const { routePoints, loading: routeLoading } = useRouteData();
  const {
    challenges,
    loading: challengesLoading,
    refetch: refetchChallenges,
  } = useChallenges(userId);
  const { groups, loading: groupsLoading } = useGroups(userId);
  const [challengeProgress, setChallengeProgress] =
    useState<ChallengeProgress | null>(null);
  const [loadingChallengeProgress, setLoadingChallengeProgress] =
    useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // Get userId from URL or localStorage
    const userIdFromUrl = searchParams.get("userId");
    const refresh = searchParams.get("refresh");
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

    // If refresh parameter is present, refetch challenges
    if (refresh === "true" && userIdFromStorage && !hasRefetched) {
      setHasRefetched(true);
      setTimeout(() => {
        refetchChallenges();
        navigate("/dashboard", { replace: true });
      }, 500);
    }
  }, [searchParams, navigate, refetchChallenges, hasRefetched]);

  // Redirect to create challenge if user has no challenges
  // Only redirect if we're not in the process of refetching (hasRefetched is false or we just refetched)
  useEffect(() => {
    if (
      !challengesLoading &&
      userId &&
      challenges.length === 0 &&
      !hasRefetched
    ) {
      // Add a small delay to avoid race condition with refetch
      const timer = setTimeout(() => {
        if (challenges.length === 0) {
          navigate("/create-challenge");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [challenges, challengesLoading, userId, navigate, hasRefetched]);

  // Get the individual challenge (first active in-progress individual challenge)
  const individualChallenge = challenges.find(
    (c) => c.challengeType === "individual"
  );

  // Fetch challenge progress for the individual challenge
  useEffect(() => {
    const fetchChallengeProgress = async () => {
      if (individualChallenge && userId) {
        try {
          setLoadingChallengeProgress(true);
          const progress = await api.getUserChallengeProgress(
            individualChallenge.id,
            userId
          );
          setChallengeProgress(progress);
        } catch (err) {
          console.error("Failed to fetch challenge progress:", err);
          setChallengeProgress(null);
        } finally {
          setLoadingChallengeProgress(false);
        }
      } else {
        setChallengeProgress(null);
      }
    };

    fetchChallengeProgress();
  }, [individualChallenge, userId]);

  const handleSync = async () => {
    if (!userId || !individualChallenge) return;

    try {
      setSyncing(true);
      await api.syncUserActivities(userId);
      // Update challenge progress after sync
      if (individualChallenge) {
        await api.updateChallengeProgress(individualChallenge.id, userId);
        // Refetch challenge progress
        const progress = await api.getUserChallengeProgress(
          individualChallenge.id,
          userId
        );
        setChallengeProgress(progress);
      }
      await refetchChallenges();
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

  const formatDistance = (km: number): string => {
    return km.toFixed(2);
  };

  if (routeLoading || challengesLoading || loadingChallengeProgress) {
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

  if (!individualChallenge) {
    navigate("/create-challenge");
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
          <div className="dashboard-header-right">
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
            </button>
            <button
              className="help-btn"
              onClick={() => setIsGuideOpen(true)}
              title="View User Guide"
            >
              Guide
            </button>
          </div>
        </div>
        <UserGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        <div className="stats-section">
          <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>
            Welcome,{" "}
            {challengeProgress?.firstName && challengeProgress?.lastName
              ? `${challengeProgress.firstName} ${challengeProgress.lastName}`
              : challengeProgress?.username || "User"}
            ! 👋
          </h2>
          <div className="stats-grid">
            <StatsCard
              title="Challenge"
              value={`${
                individualChallenge.name
              }`}
              icon="🗺️"
              color="#66dfeaff"
            />
            <StatsCard
              title="Distance Covered"
              value={`${formatDistance(
                individualChallenge.totalDistanceCovered
              )} km`}
              icon="📏"
              color="#667eea"
            />
            <StatsCard
              title="Remaining Distance"
              value={`${formatDistance(
                Math.max(
                  0,
                  individualChallenge.targetDistanceKm -
                    individualChallenge.totalDistanceCovered
                )
              )} km`}
              icon="🗺️"
              color="#38B2AC"
            />
            <StatsCard
              title="Progress"
              value={`${individualChallenge.progressPercentage.toFixed(2)}%`}
              icon="📊"
              color="#4facfe"
            />
            <StatsCard
              title="Target Distance"
              value={`${formatDistance(
                individualChallenge.targetDistanceKm
              )} km`}
              icon="🎯"
              color="#f093fb"
            />
            {individualChallenge.status === "in_progress" && (
              <StatsCard
                title="Days Remaining"
                value={`${individualChallenge.daysRemaining} days`}
                icon="⏰"
                color="#43e97b"
              />
            )}
            {individualChallenge.status === "completed" && (
              <StatsCard
                title="Completed On"
                value={`${
                  challengeProgress?.lastActivityDate &&
                  new Date(challengeProgress.lastActivityDate).toLocaleDateString()
                }`}
                icon="🏁"
                color="#43e97b"
              />
            )}
          </div>
          <div className="sync-info-container">
            {challengeProgress?.updatedAt && (
              <p className="last-sync">
                Last Synced:{" "}
                {new Date(challengeProgress.updatedAt).toLocaleString()}
              </p>
            )}
            {challengeProgress?.lastActivityDate && (
              <p className="last-sync">
                Previsous Ride:{" "}
                {new Date(challengeProgress.lastActivityDate).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="map-section">
          <h2>Your Virtual Location</h2>
          <MapView
            routePoints={routePoints}
            progressPercent={individualChallenge.progressPercentage}
            coveredDistanceKm={individualChallenge.totalDistanceCovered}
          />
        </div>

        {/* <div className="challenges-section">
          <div className="section-header">
            <h2>Your Main Challenge</h2>
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
                onClick={() => navigate("/create-challenge")}
              >
                Create challenge
              </button>
            </div>
          ) : individualChallenge ? (
            <div className="main-challenge-container">
              <div
                className="main-challenge-card"
                onClick={() =>
                  navigate(`/challenges/${individualChallenge.id}`)
                }
              >
                <div className="challenge-header-main">
                  <h3>{individualChallenge.name}</h3>
                  <span
                    className={`status-badge status-${individualChallenge.status}`}
                  >
                    {individualChallenge.status === "in_progress"
                      ? "In Progress"
                      : individualChallenge.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                  </span>
                </div>
                {individualChallenge.description && (
                  <p className="challenge-description">
                    {individualChallenge.description}
                  </p>
                )}
                <div className="challenge-stats-main">
                  <div className="stat-item">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">
                      {individualChallenge.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Distance Covered</span>
                    <span className="stat-value">
                      {individualChallenge.totalDistanceCovered.toFixed(2)} km
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">
                      {individualChallenge.targetDistanceKm.toFixed(2)} km
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Days Remaining</span>
                    <span className="stat-value">
                      {individualChallenge.daysRemaining}
                    </span>
                  </div>
                </div>
                <div className="challenge-dates-main">
                  {new Date(individualChallenge.startDate).toLocaleDateString()}{" "}
                  - {new Date(individualChallenge.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : null}
        </div> */}

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
