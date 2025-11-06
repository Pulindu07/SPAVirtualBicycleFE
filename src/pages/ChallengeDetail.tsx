import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useChallenge,
  useChallengeLeaderboard,
  useInterGroupLeaderboard,
} from "../hooks/useChallenges";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import { ChallengeMapView } from "../components/ChallengeMapView";
import type { RoutePoint } from "../types";
import "./ChallengeDetail.css";

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = id ? parseInt(id) : null;
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin } = useAuth(userId);
  const { challenge, loading, error, refetch } = useChallenge(
    challengeId,
    userId
  );
  const {
    leaderboard,
    loading: leaderboardLoading,
    refetch: refetchLeaderboard,
  } = useChallengeLeaderboard(challengeId, userId || undefined);
  const {
    leaderboard: interGroupLeaderboard,
    loading: interGroupLoading,
    refetch: refetchInterGroup,
  } = useInterGroupLeaderboard(challengeId);
  const [syncing, setSyncing] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeLoading, setRouteLoading] = useState(true);

  // Fetch route points for the challenge
  useEffect(() => {
    const fetchRoutePoints = async () => {
      if (!challenge?.routeId) {
        // Use default route if no routeId specified
        try {
          setRouteLoading(true);
          const points = await api.getRoutePoints();
          setRoutePoints(points);
        } catch (error) {
          console.error("Failed to fetch route points:", error);
        } finally {
          setRouteLoading(false);
        }
      } else {
        try {
          setRouteLoading(true);
          const points = await api.getRoutePoints(challenge.routeId);
          setRoutePoints(points);
        } catch (error) {
          console.error("Failed to fetch route points:", error);
        } finally {
          setRouteLoading(false);
        }
      }
    };

    if (challenge) {
      fetchRoutePoints();
    }
  }, [challenge]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleSync = async () => {
    if (!challengeId) return;

    try {
      setSyncing(true);
      if (challenge?.challengeType === "group") {
        await api.syncGroupChallenge(challengeId);
      } else if (challenge?.challengeType === "inter-group") {
        await api.syncInterGroupChallenge(challengeId);
      }
      await refetch();
      await refetchLeaderboard();
      await refetchInterGroup();
      alert("Challenge synced successfully!");
    } catch (error) {
      console.error("Failed to sync challenge:", error);
      alert("Failed to sync challenge. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleJoin = async () => {
    if (!challengeId || !userId) return;

    try {
      await api.joinChallenge(challengeId, userId);
      await refetch();
      alert("Joined challenge successfully!");
    } catch (error) {
      console.error("Failed to join challenge:", error);
      alert("Failed to join challenge. Please try again.");
    }
  };

  const handleLeave = async () => {
    if (!challengeId || !userId) return;

    try {
      await api.leaveChallenge(challengeId, userId);
      await refetch();
      alert("Left challenge successfully!");
    } catch (error) {
      console.error("Failed to leave challenge:", error);
      alert("Failed to leave challenge. Please try again.");
    }
  };

  if (!userId) {
    navigate("/");
    return null;
  }

  if (loading) {
    return (
      <div className="challenge-detail-page">
        <Navigation
          userId={userId}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
        <div className="loading">Loading challenge...</div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="challenge-detail-page">
        <Navigation
          userId={userId}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
        <div className="error">Error: {error || "Challenge not found"}</div>
      </div>
    );
  }

  const isParticipant = challenge.participantCount > 0;
  const isGroupChallenge =
    challenge.challengeType === "group" ||
    challenge.challengeType === "inter-group";

  return (
    <div className="challenge-detail-page">
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="challenge-detail-container">
        <button className="back-button" onClick={() => navigate("/challenges")}>
          ← Back to Challenges
        </button>

        <div className="challenge-header">
          <div>
            <h1>{challenge.name}</h1>
            {challenge.description && (
              <p className="challenge-description">{challenge.description}</p>
            )}
          </div>
          <div className="challenge-actions">
            {isGroupChallenge && (
              <button
                className="btn-primary"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? "Syncing..." : "🔄 Sync Challenge"}
              </button>
            )}
            {isParticipant ? (
              <button className="btn-secondary" onClick={handleLeave}>
                Leave Challenge
              </button>
            ) : (
              challenge.challengeType === "individual" && (
                <button className="btn-primary" onClick={handleJoin}>
                  Join Challenge
                </button>
              )
            )}
          </div>
        </div>

        <div className="challenge-info-grid">
          <div className="info-card">
            <div className="info-label">Type</div>
            <div className="info-value">
              {challenge.challengeType === "individual"
                ? "Individual"
                : challenge.challengeType === "group"
                ? "Group"
                : "Inter-Group"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Target Distance</div>
            <div className="info-value">{challenge.targetDistanceKm} km</div>
          </div>
          <div className="info-card">
            <div className="info-label">Progress</div>
            <div className="info-value">
              {challenge.progressPercentage.toFixed(1)}%
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Participants</div>
            <div className="info-value">{challenge.participantCount}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Start Date</div>
            <div className="info-value">
              {new Date(challenge.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">End Date</div>
            <div className="info-value">
              {new Date(challenge.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {challenge.challengeType === "inter-group" ? (
          <div className="leaderboard-section">
            <h2>Group Rankings</h2>
            {interGroupLoading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : interGroupLeaderboard ? (
              <div className="leaderboard">
                {interGroupLeaderboard.groupRankings.map((group, index) => (
                  <div key={group.groupId} className="leaderboard-entry">
                    <div className="rank">#{index + 1}</div>
                    <div className="entry-info">
                      <div className="entry-name">{group.groupName}</div>
                      <div className="entry-stats">
                        <span>{group.totalDistanceCovered.toFixed(2)} km</span>
                        <span>{group.progressPercentage.toFixed(1)}%</span>
                        <span>{group.memberCount} members</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No group rankings available</div>
            )}
          </div>
        ) : (
          <div className="leaderboard-section">
            <h2>Leaderboard</h2>
            {leaderboardLoading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : leaderboard ? (
              <div className="leaderboard">
                {leaderboard.entries.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`leaderboard-entry ${
                      entry.isCurrentUser ? "current-user" : ""
                    }`}
                  >
                    <div className="rank">#{entry.rank}</div>
                    <div className="entry-info">
                      <div className="entry-name">
                        {entry.firstName} {entry.lastName}{" "}
                        {entry.isCurrentUser && "(You)"}
                      </div>
                      <div className="entry-stats">
                        <span>{entry.distanceCoveredKm.toFixed(2)} km</span>
                        <span>{entry.progressPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No leaderboard data available</div>
            )}
          </div>
        )}

        {/* Challenge Map - Show all participants */}
        {challenge.challengeType !== "inter-group" &&
          leaderboard &&
          leaderboard.entries.length > 0 && (
            <div className="challenge-map-section">
              <h2>Participants on Map</h2>
              {routeLoading ? (
                <div className="loading">Loading map...</div>
              ) : routePoints.length > 0 ? (
                <ChallengeMapView
                  routePoints={routePoints}
                  leaderboardEntries={leaderboard.entries}
                  challengeRouteId={challenge.routeId}
                />
              ) : (
                <div className="empty-state">No route data available</div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
