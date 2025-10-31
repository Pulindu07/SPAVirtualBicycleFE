import { useState, useEffect } from "react";
import { api } from "../api/client";
import { UserProgress } from "../types";

export const useUserProgress = (userId: number | null) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserProgress(userId);
      setProgress(data);
    } catch (err) {
      setError("Failed to fetch user progress");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const refetch = () => {
    fetchProgress();
  };

  return { progress, loading, error, refetch };
};
