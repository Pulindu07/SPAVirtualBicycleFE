import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { Group, GroupMember } from "../types";

export const useGroups = (userId: number | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserGroups(userId);
      setGroups(data);
    } catch (err) {
      setError("Failed to fetch groups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  const refetch = () => {
    fetchGroups();
  };

  return { groups, loading, error, refetch };
};

export const useGroup = (groupId: number | null) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getGroup(groupId);
      setGroup(data);
    } catch (err) {
      setError("Failed to fetch group");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const refetch = () => {
    fetchGroup();
  };

  return { group, loading, error, refetch };
};

export const useGroupMembers = (groupId: number | null) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      setError("Failed to fetch group members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const refetch = () => {
    fetchMembers();
  };

  return { members, loading, error, refetch };
};
