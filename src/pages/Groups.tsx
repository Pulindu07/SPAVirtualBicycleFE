import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Navigation } from "../components/Navigation";
import type { CreateGroupDto } from "../types";
import "./Groups.css";

export const Groups = () => {
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId") || "0") || null;
  const { isSuperAdmin } = useAuth(userId);
  const { groups, loading, error, refetch } = useGroups(userId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateGroupDto>({
    name: "",
    iconUrl: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !isSuperAdmin) return;

    try {
      setCreating(true);
      await api.createGroup(userId, formData);
      setShowCreateForm(false);
      setFormData({ name: "", iconUrl: "" });
      await refetch();
      alert("Group created successfully!");
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!userId) {
    navigate("/");
    return null;
  }

  return (
    <div className="groups-page">
      <Navigation
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      <div className="groups-container">
        <div className="groups-header">
          <h1>Groups</h1>
          {isSuperAdmin && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ Create Group"}
            </button>
          )}
        </div>

        {showCreateForm && isSuperAdmin && (
          <div className="create-group-form">
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name *</label>
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
                <label>Icon URL (optional)</label>
                <input
                  type="url"
                  value={formData.iconUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, iconUrl: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        )}

        {loading && <div className="loading">Loading groups...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <div className="groups-grid">
            {groups.length === 0 ? (
              <div className="empty-state">
                <p>
                  No groups found. {isSuperAdmin && "Create your first group!"}
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-header">
                    {group.iconUrl && (
                      <img
                        src={group.iconUrl}
                        alt={group.name}
                        className="group-icon"
                      />
                    )}
                    <h3>{group.name}</h3>
                  </div>
                  <div className="group-stats">
                    <div className="stat">
                      <span className="stat-label">Members</span>
                      <span className="stat-value">{group.memberCount}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Created by</span>
                      <span className="stat-value">
                        {group.createdByUsername}
                      </span>
                    </div>
                  </div>
                  <div className="group-date">
                    Created: {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
