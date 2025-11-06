import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChallenges } from "../hooks/useChallenges";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import type { CreateChallengeDto } from "../types";
import "./Challenges.css";

export const Challenges = () => {
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin } = useAuth(userId);
  const { challenges, loading, error, refetch } = useChallenges(userId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateChallengeDto>({
    name: "",
    description: "",
    targetDistanceKm: 100,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    challengeType: "individual",
    groupIds: [],
    routeId: undefined,
  });

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !isSuperAdmin) return;

    try {
      setCreating(true);
      await api.createChallenge(userId, formData);
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        targetDistanceKm: 100,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        challengeType: "individual",
        groupIds: [],
        routeId: undefined,
      });
      await refetch();
      alert("Challenge created successfully!");
    } catch (error) {
      console.error("Failed to create challenge:", error);
      alert("Failed to create challenge. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (challenge: any) => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) return { text: "Upcoming", class: "status-upcoming" };
    if (now > end) return { text: "Completed", class: "status-completed" };
    return { text: "In Progress", class: "status-in-progress" };
  };

  if (!userId) {
    navigate("/");
    return null;
  }

  return (
    <div className="challenges-page">
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="challenges-container">
        <div className="challenges-header">
          <h1>Challenges</h1>
          {isSuperAdmin && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ Create Challenge"}
            </button>
          )}
        </div>

        {showCreateForm && isSuperAdmin && (
          <div className="create-challenge-form">
            <h2>Create New Challenge</h2>
            <form onSubmit={handleCreateChallenge}>
              <div className="form-group">
                <label>Challenge Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Distance (km) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetDistanceKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetDistanceKm: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Challenge Type *</label>
                  <select
                    required
                    value={formData.challengeType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        challengeType: e.target.value,
                      })
                    }
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                    <option value="inter-group">Inter-Group</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Route ID (optional)</label>
                <input
                  type="number"
                  value={formData.routeId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      routeId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create Challenge"}
              </button>
            </form>
          </div>
        )}

        {loading && <div className="loading">Loading challenges...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <div className="challenges-grid">
            {challenges.length === 0 ? (
              <div className="empty-state">
                <p>
                  No challenges found.{" "}
                  {isSuperAdmin && "Create your first challenge!"}
                </p>
              </div>
            ) : (
              challenges.map((challenge) => {
                const status = getStatusBadge(challenge);
                return (
                  <div
                    key={challenge.id}
                    className="challenge-card"
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                  >
                    <div className="challenge-header">
                      <h3>{challenge.name}</h3>
                      <span className={`status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="challenge-card-content">
                      {challenge.description && (
                        <p className="challenge-description">
                          {challenge.description}
                        </p>
                      )}
                      <div className="challenge-stats">
                        <div className="stat">
                          <span className="stat-label">Type</span>
                          <span className="stat-value">
                            {challenge.challengeType === "individual"
                              ? "Individual"
                              : challenge.challengeType === "group"
                              ? "Group"
                              : "Inter-Group"}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Target</span>
                          <span className="stat-value">
                            {challenge.targetDistanceKm} km
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Progress</span>
                          <span className="stat-value">
                            {challenge.progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Participants</span>
                          <span className="stat-value">
                            {challenge.participantCount}
                          </span>
                        </div>
                      </div>
                      <div className="challenge-dates">
                        {new Date(challenge.startDate).toLocaleDateString()} -{" "}
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
