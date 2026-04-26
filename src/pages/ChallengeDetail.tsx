import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useChallenge,
  useChallengeLeaderboard,
  useInterGroupLeaderboard,
} from "../hooks/useChallenges";
import { useAuth } from "../hooks/useAuth";
import { useRouteData } from "../hooks/useRouteData";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import { ChallengeMapView } from "../components/ChallengeMapView";
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
  } = useInterGroupLeaderboard(challengeId, userId || undefined);
  const [syncing, setSyncing] = useState(false);

  // Fetch route points for this challenge only. If the challenge has no routeId,
  // do NOT fall back to the global default route — show the empty state instead.
  const { routePoints, loading: routeLoading } = useRouteData(
    challenge?.routeId ?? undefined,
    { allowDefaultFallback: false }
  );

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
                ? "🏃 Individual"
                : challenge.challengeType === "group"
                ? "👥 Group"
                : "🏆 Inter-Group"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Target Distance</div>
            <div className="info-value">
              📍 {challenge.targetDistanceKm.toFixed(2)} km
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Progress</div>
            <div className="info-value">
              📊 {Math.min(challenge.progressPercentage, 100).toFixed(1)}%
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">
              {challenge.challengeType === "inter-group"
                ? "Groups"
                : "Participants"}
            </div>
            <div className="info-value">
              {challenge.challengeType === "inter-group" ? "👥" : "👤"}{" "}
              {challenge.challengeType === "inter-group"
                ? challenge.groupCount
                : challenge.participantCount}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Start Date</div>
            <div className="info-value">
              🗓️ {new Date(challenge.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">End Date</div>
            <div className="info-value">
              🏁 {new Date(challenge.endDate).toLocaleDateString()}
            </div>
          </div>
          {challenge.status === "completed" && (
            <div className="info-card">
              <div className="info-label">Status</div>
              <div className="info-value">🏁 Completed</div>
            </div>
          )}
        </div>

        {challenge.challengeType === "inter-group" ? (
          <>
            <div className="leaderboard-section">
              <h2>Group Rankings</h2>
              {interGroupLoading ? (
                <div className="loading">Loading leaderboard...</div>
              ) : interGroupLeaderboard ? (
                <div className="leaderboard">
                  {interGroupLeaderboard.groupRankings.map((group) => (
                    <div key={group.groupId} className="leaderboard-entry">
                      <div className="rank">
                        {group.groupIconUrl ? (
                          <img
                            src={group.groupIconUrl}
                            height={"48ox"}
                            width={"48px"}
                            onError={(e) => {
                              // fallback to emoji if the image fails to load
                              e.currentTarget.onerror = null; // prevent infinite loop
                              e.currentTarget.style.display = "none"; // hide broken image
                              e.currentTarget.insertAdjacentText(
                                "afterend",
                                "👥"
                              );
                            }}
                          />
                        ) : (
                          "👥"
                        )}
                        #{group.rank}
                      </div>
                      <div className="entry-info">
                        <div className="entry-name">{group.groupName}</div>
                        <div className="entry-stats">
                          <span>
                            📍 {group.totalDistanceCovered.toFixed(2)} km
                          </span>
                          <span>
                            📊{" "}
                            {Math.min(group.progressPercentage, 100).toFixed(1)}
                            %
                          </span>
                          <span>👤 {group.memberCount} members</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No group rankings available</div>
              )}
            </div>

            {interGroupLeaderboard?.userGroupMemberRankings &&
              interGroupLeaderboard.userGroupMemberRankings.length > 0 && (
                <div className="leaderboard-section">
                  <h2>
                    Group Progress
                    {interGroupLeaderboard.userGroupName && (
                      <span
                        style={{ fontWeight: "normal", fontSize: "0.85rem" }}
                      >
                        {" "}
                        ({interGroupLeaderboard.userGroupName})
                      </span>
                    )}
                  </h2>
                  <div className="leaderboard">
                    {interGroupLeaderboard.userGroupMemberRankings.map(
                      (entry) => (
                        <div
                          key={entry.userId}
                          className={`leaderboard-entry ${
                            entry.isCurrentUser ? "current-user" : ""
                          }`}
                        >
                          <div className="rank">👤 #{entry.rank}</div>
                          <div className="entry-info">
                            <div className="entry-name">
                              {entry.firstName} {entry.lastName}{" "}
                              {entry.isCurrentUser && "(You)"}
                            </div>
                            <div className="entry-stats">
                              <span>
                                📍 {entry.distanceCoveredKm.toFixed(2)} km
                              </span>
                              <span>
                                📊{" "}
                                {Math.min(
                                  entry.progressPercentage,
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </>
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
                    <div className="rank">👤 #{entry.rank}</div>
                    <div className="entry-info">
                      <div className="entry-name">
                        {entry.firstName} {entry.lastName}{" "}
                        {entry.isCurrentUser && "(You)"}
                      </div>
                      <div className="entry-stats">
                        <span>📍 {entry.distanceCoveredKm.toFixed(2)} km</span>
                        <span>
                          📊{" "}
                          {Math.min(entry.progressPercentage, 100).toFixed(1)}%
                        </span>
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

        {/* Challenge Map - Show participants or groups */}
        {((challenge.challengeType !== "inter-group" &&
          leaderboard &&
          leaderboard.entries.length > 0) ||
          (challenge.challengeType === "inter-group" &&
            interGroupLeaderboard &&
            interGroupLeaderboard.groupRankings.length > 0)) && (
          <div className="challenge-map-section">
            <h2>
              {challenge.challengeType === "inter-group"
                ? "Groups on Map"
                : "Participants on Map"}
            </h2>
            {!challenge.routeId ? (
              <div className="empty-state">
                No route configured for this challenge
              </div>
            ) : routeLoading || interGroupLoading ? (
              <div className="loading">Loading map...</div>
            ) : routePoints.length > 0 ? (
              challenge.challengeType === "inter-group" ? (
                <ChallengeMapView
                  routePoints={routePoints}
                  leaderboardEntries={[]}
                  challengeRouteId={challenge.routeId}
                  groupRankings={interGroupLeaderboard?.groupRankings || []}
                />
              ) : (
                <ChallengeMapView
                  routePoints={routePoints}
                  leaderboardEntries={leaderboard?.entries || []}
                  challengeRouteId={challenge.routeId}
                />
              )
            ) : (
              <div className="empty-state">No route data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
