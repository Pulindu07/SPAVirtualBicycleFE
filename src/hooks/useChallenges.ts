import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { Challenge, Leaderboard, InterGroupLeaderboard } from "../types";

export const useChallenges = (userId: number | null) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserChallenges(userId);
      setChallenges(data);
    } catch (err) {
      setError("Failed to fetch challenges");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [userId]);

  const refetch = () => {
    fetchChallenges();
  };

  return { challenges, loading, error, refetch };
};

export const useChallenge = (
  challengeId: number | null,
  userId?: number | null
) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getChallenge(challengeId, userId || undefined);
      setChallenge(data);
    } catch (err) {
      setError("Failed to fetch challenge");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [challengeId, userId]);

  const refetch = () => {
    fetchChallenge();
  };

  return { challenge, loading, error, refetch };
};

export const useChallengeLeaderboard = (
  challengeId: number | null,
  userId?: number
) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getChallengeLeaderboard(challengeId, userId);
      setLeaderboard(data);
    } catch (err) {
      setError("Failed to fetch leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId, userId]);

  const refetch = () => {
    fetchLeaderboard();
  };

  return { leaderboard, loading, error, refetch };
};

export const useInterGroupLeaderboard = (challengeId: number | null) => {
  const [leaderboard, setLeaderboard] = useState<InterGroupLeaderboard | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getInterGroupLeaderboard(challengeId);
      setLeaderboard(data);
    } catch (err) {
      setError("Failed to fetch inter-group leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const refetch = () => {
    fetchLeaderboard();
  };

  return { leaderboard, loading, error, refetch };
};
