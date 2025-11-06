import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { User } from "../types";

export const useAuth = (userId: number | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getUser(userId);
      setUser(data);
    } catch (err) {
      setError("Failed to fetch user information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const refetch = () => {
    fetchUser();
  };

  const isSuperAdmin = user?.isSuperAdmin ?? false;

  return { user, loading, error, refetch, isSuperAdmin };
};
