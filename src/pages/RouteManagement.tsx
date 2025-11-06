import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import type { Route, GenerateRouteRequest, Waypoint } from "../types";
import "./RouteManagement.css";

export const RouteManagement = () => {
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin, loading: authLoading } = useAuth(userId);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState<GenerateRouteRequest>({
    routeId: undefined,
    routeName: "",
    routeDescription: "",
    waypoints: [],
  });

  const [currentWaypoint, setCurrentWaypoint] = useState<Waypoint>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;

    if (!isSuperAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchRoutes();
  }, [isSuperAdmin, authLoading, navigate]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError("Failed to fetch routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleAddWaypoint = () => {
    if (currentWaypoint.latitude && currentWaypoint.longitude) {
      setFormData({
        ...formData,
        waypoints: [...(formData.waypoints || []), { ...currentWaypoint }],
      });
      setCurrentWaypoint({ latitude: 0, longitude: 0 });
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = [...(formData.waypoints || [])];
    newWaypoints.splice(index, 1);
    setFormData({ ...formData, waypoints: newWaypoints });
  };

  const handleGenerateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.routeName ||
      (formData.waypoints && formData.waypoints.length < 2)
    ) {
      alert("Please provide a route name and at least 2 waypoints");
      return;
    }

    try {
      setGenerating(true);
      const result = await api.generateRoute(formData);
      alert(
        `Route generated successfully!\nRoute ID: ${
          result.routeId
        }\nDistance: ${result.totalDistanceKm.toFixed(2)} km\nPoints: ${
          result.pointCount
        }`
      );
      setShowGenerateForm(false);
      setFormData({
        routeId: undefined,
        routeName: "",
        routeDescription: "",
        waypoints: [],
      });
      await fetchRoutes();
    } catch (error) {
      console.error("Failed to generate route:", error);
      alert("Failed to generate route. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!userId) {
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="route-management-page">
        <Navigation
          userId={userId}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
        <div className="loading">Checking permissions...</div>
      </div>
    );
  }

  // Redirect if not super admin (handled by useEffect, but show message while redirecting)
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="route-management-page">
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="route-management-container">
        <div className="route-management-header">
          <h1>Route Management</h1>
          <button
            className="btn-primary"
            onClick={() => setShowGenerateForm(!showGenerateForm)}
          >
            {showGenerateForm ? "Cancel" : "+ Generate Route"}
          </button>
        </div>

        {showGenerateForm && (
          <div className="generate-route-form">
            <h2>Generate New Route</h2>
            <form onSubmit={handleGenerateRoute}>
              <div className="form-group">
                <label>Route Name *</label>
                <input
                  type="text"
                  required
                  value={formData.routeName}
                  onChange={(e) =>
                    setFormData({ ...formData, routeName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Route Description</label>
                <textarea
                  value={formData.routeDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      routeDescription: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Route ID (optional - to update existing route)</label>
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
              <div className="form-group">
                <label>Waypoints * (at least 2 required)</label>
                <div className="waypoint-input">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={currentWaypoint.latitude || ""}
                    onChange={(e) =>
                      setCurrentWaypoint({
                        ...currentWaypoint,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={currentWaypoint.longitude || ""}
                    onChange={(e) =>
                      setCurrentWaypoint({
                        ...currentWaypoint,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddWaypoint}
                  >
                    Add Waypoint
                  </button>
                </div>
                {formData.waypoints && formData.waypoints.length > 0 && (
                  <div className="waypoints-list">
                    {formData.waypoints.map((wp, index) => (
                      <div key={index} className="waypoint-item">
                        <span>
                          {index + 1}. {wp.latitude.toFixed(6)},{" "}
                          {wp.longitude.toFixed(6)}
                        </span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveWaypoint(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Route"}
              </button>
            </form>
          </div>
        )}

        {loading && <div className="loading">Loading routes...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <div className="routes-list">
            <h2>Existing Routes</h2>
            {routes.length === 0 ? (
              <div className="empty-state">
                No routes found. Generate your first route!
              </div>
            ) : (
              <div className="routes-grid">
                {routes.map((route) => (
                  <div key={route.id} className="route-card">
                    <h3>{route.name}</h3>
                    {route.description && (
                      <p className="route-description">{route.description}</p>
                    )}
                    <div className="route-stats">
                      <div className="stat">
                        <span className="stat-label">Distance</span>
                        <span className="stat-value">
                          {route.totalDistanceKm.toFixed(2)} km
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Status</span>
                        <span
                          className={`stat-value ${
                            route.isActive ? "active" : "inactive"
                          }`}
                        >
                          {route.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="route-date">
                      Created: {new Date(route.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
