import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import type { CreateChallengeDto, Route } from "../types";
import "./CreateChallenge.css";

export const CreateChallenge = () => {
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin } = useAuth(userId);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [challengeType, setChallengeType] = useState<
    "custom" | "default" | null
  >(null);

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

  const handleCreateCustomChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setCreating(true);
      await api.createChallenge(userId, formData);
      // Add a small delay to ensure backend has processed the challenge
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/dashboard?refresh=true");
    } catch (error: any) {
      console.error("Failed to create challenge:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create challenge. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCreateDefaultChallenge = async () => {
    if (!userId || routes.length === 0) {
      alert("No routes available. Please contact an administrator.");
      return;
    }

    // Find Route One (first route or route with ID 1)
    const routeOne = routes.find((r) => r.id === 1) || routes[0];
    if (!routeOne) {
      alert("Route One not found. Please contact an administrator.");
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const defaultChallenge: CreateChallengeDto = {
      name: "Default Challenge",
      description: "Default challenge created automatically",
      targetDistanceKm: routeOne.totalDistanceKm,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      challengeType: "individual",
      groupIds: [],
      routeId: routeOne.id,
    };

    try {
      setCreating(true);
      await api.createChallenge(userId, defaultChallenge);
      // Add a small delay to ensure backend has processed the challenge
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/dashboard?refresh=true");
    } catch (error: any) {
      console.error("Failed to create default challenge:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create default challenge. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!userId) {
    navigate("/");
    return null;
  }

  return (
    <div className="create-challenge-page">
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="create-challenge-container">
        <div className="create-challenge-header">
          <h1>Create Challenge</h1>
          <p>Choose how you want to create your challenge</p>
        </div>

        {!challengeType ? (
          <div className="challenge-type-cards">
            <div
              className="challenge-type-card"
              onClick={() => setChallengeType("custom")}
            >
              <div className="card-icon">⚙️</div>
              <h2>Custom Challenge</h2>
              <p>
                Create a challenge with custom settings. You can select the
                start date, end date, and route.
              </p>
              <button className="btn-primary">Create Custom Challenge</button>
            </div>

            <div
              className="challenge-type-card"
              onClick={() => setChallengeType("default")}
            >
              <div className="card-icon">🚀</div>
              <h2>Default Challenge</h2>
              <p>
                Create a challenge with default settings. Start date: Today, End
                date: 1 year from today, Route: Route One.
              </p>
              <button className="btn-primary">Create Default Challenge</button>
            </div>
          </div>
        ) : challengeType === "custom" ? (
          <div className="create-challenge-form-container">
            <button className="btn-back" onClick={() => setChallengeType(null)}>
              ← Back
            </button>
            <div className="create-challenge-form">
              <h2>Create Custom Challenge</h2>
              <form onSubmit={handleCreateCustomChallenge}>
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
                    <label>Route *</label>
                    {loadingRoutes ? (
                      <div>Loading routes...</div>
                    ) : (
                      <select
                        required
                        value={formData.routeId || ""}
                        onChange={(e) =>
                          handleRouteChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
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
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setChallengeType(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Challenge"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="create-default-challenge-container">
            <button className="btn-back" onClick={() => setChallengeType(null)}>
              ← Back
            </button>
            <div className="default-challenge-info">
              <h2>Create Default Challenge</h2>
              <div className="default-challenge-details">
                <div className="detail-item">
                  <strong>Start Date:</strong> Today (
                  {new Date().toLocaleDateString()})
                </div>
                <div className="detail-item">
                  <strong>End Date:</strong>{" "}
                  {new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1)
                  ).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Route:</strong> Route One
                  {routes.length > 0 && (
                    <span>
                      {" "}
                      (
                      {routes.find((r) => r.id === 1)?.name ||
                        routes[0]?.name ||
                        "Loading..."}
                      )
                    </span>
                  )}
                </div>
                <div className="detail-item">
                  <strong>Target Distance:</strong>{" "}
                  {routes.find((r) => r.id === 1)?.totalDistanceKm.toFixed(2) ||
                    routes[0]?.totalDistanceKm.toFixed(2) ||
                    "Loading..."}{" "}
                  km
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setChallengeType(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCreateDefaultChallenge}
                  disabled={creating || loadingRoutes}
                >
                  {creating ? "Creating..." : "Create Default Challenge"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
