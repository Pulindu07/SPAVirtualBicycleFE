import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChallenges } from "../hooks/useChallenges";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import type { CreateChallengeDto, Group, Route } from "../types";
import "./Challenges.css";

export const Challenges = () => {
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin } = useAuth(userId);
  const { challenges, loading, error, refetch } = useChallenges(userId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

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

  // Fetch groups when challenge type is group or inter-group
  useEffect(() => {
    const fetchGroups = async () => {
      if (
        userId &&
        isSuperAdmin &&
        (formData.challengeType === "group" ||
          formData.challengeType === "inter-group")
      ) {
        try {
          setLoadingGroups(true);
          const allGroups = await api.getAllGroups(userId);
          setGroups(allGroups);
        } catch (error) {
          console.error("Failed to fetch groups:", error);
          setGroups([]);
        } finally {
          setLoadingGroups(false);
        }
      } else {
        setGroups([]);
      }
    };

    fetchGroups();
  }, [formData.challengeType, userId, isSuperAdmin]);

  // Fetch routes on component mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const allRoutes = await api.getRoutes();
        setRoutes(allRoutes);
      } catch (error) {
        console.error("Failed to fetch routes:", error);
        setRoutes([]);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleRouteChange = (routeId: number | undefined) => {
    if (routeId) {
      const selectedRoute = routes.find((r) => r.id === routeId);
      if (selectedRoute) {
        setFormData({
          ...formData,
          routeId: routeId,
          targetDistanceKm: selectedRoute.totalDistanceKm,
        });
      }
    } else {
      setFormData({
        ...formData,
        routeId: undefined,
      });
    }
  };

  const handleGroupToggle = (groupId: number) => {
    const currentGroupIds = formData.groupIds || [];
    if (currentGroupIds.includes(groupId)) {
      setFormData({
        ...formData,
        groupIds: currentGroupIds.filter((id) => id !== groupId),
      });
    } else {
      setFormData({
        ...formData,
        groupIds: [...currentGroupIds, groupId],
      });
    }
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

  const formatText = (text: string) => {  
    if(text === "in_progress") return "In Progress";
    else if(text === "upcoming") return "Upcoming";
    else if(text === "completed") return "Completed";
    else if(text === "not_completed") return "Not Completed";
    return text;
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
                  <label>Challenge Type *</label>
                  <select
                    required
                    value={formData.challengeType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        challengeType: newType,
                        groupIds:
                          newType === "individual" ? [] : formData.groupIds,
                      });
                    }}
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                    <option value="inter-group">Inter-Group</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Route *</label>
                  {loadingRoutes ? (
                    <div>Loading routes...</div>
                  ) : (
                    <select
                      required
                      value={formData.routeId || ""}
                      onChange={(e) =>
                        handleRouteChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    >
                      <option value="">Select a route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({route.totalDistanceKm.toFixed(2)} km)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Distance (km) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.targetDistanceKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetDistanceKm: parseFloat(e.target.value) || 0,
                      })
                    }
                    readOnly={!!formData.routeId}
                    style={{
                      backgroundColor: formData.routeId ? "#f0f0f0" : "white",
                    }}
                  />
                  {formData.routeId && (
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      Auto-filled from selected route
                    </small>
                  )}
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
              {(formData.challengeType === "group" ||
                formData.challengeType === "inter-group") && (
                <div className="form-group">
                  <label>
                    Select Groups *{" "}
                    {formData.challengeType === "inter-group" &&
                      "(Select 2 or more groups)"}
                  </label>
                  {loadingGroups ? (
                    <div>Loading groups...</div>
                  ) : groups.length === 0 ? (
                    <div style={{ color: "#999" }}>No groups available</div>
                  ) : (
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      {groups.map((group) => (
                        <label
                          key={group.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.groupIds?.includes(group.id) || false
                            }
                            onChange={() => handleGroupToggle(group.id)}
                            style={{ marginRight: "8px" }}
                          />
                          <span>
                            {group.name} ({group.memberCount} members)
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {formData.groupIds && formData.groupIds.length > 0 && (
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      {formData.groupIds.length} group(s) selected
                    </small>
                  )}
                </div>
              )}
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
                return (
                  <div
                    key={challenge.id}
                    className="challenge-card"
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                  >
                    <div className="challenge-header">
                      <h3>{challenge.name}</h3>
                      <span className={`status-badge status-in_progress`}>
                        {formatText(challenge.status)}
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
                            {challenge.targetDistanceKm.toFixed(2)} km
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Progress</span>
                          <span className="stat-value">
                            {Math.min(
                              challenge.progressPercentage,
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">
                            {challenge.challengeType === "inter-group"
                              ? "Groups"
                              : "Participants"}
                          </span>
                          <span className="stat-value">
                            {challenge.challengeType === "inter-group"
                              ? challenge.groupCount
                              : challenge.participantCount}
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
