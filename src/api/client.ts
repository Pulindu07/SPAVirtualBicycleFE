import axios from "axios";
import type {
  RoutePoint,
  UserProgress,
  User,
  Challenge,
  CreateChallengeDto,
  ChallengeProgress,
  GroupChallengeProgress,
  Leaderboard,
  InterGroupLeaderboard,
  Group,
  CreateGroupDto,
  GroupMember,
  AddGroupMemberDto,
  Route,
  GenerateRouteRequest,
  RouteGenerationResult,
} from "../types";

const API_BASE_URL =
  "https://virtualexerciseappbe-cvecdnfsfta0axd5.eastus2-01.azurewebsites.net/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define API methods
export const api = {
  // Auth
  getStravaLoginUrl: () => `${API_BASE_URL}/auth/strava/login`,

  // User
  getUserProgress: async (userId: number): Promise<UserProgress> => {
    const response = await apiClient.get<UserProgress>(
      `/user/${userId}/progress`
    );
    return response.data;
  },

  syncUserActivities: async (userId: number): Promise<void> => {
    await apiClient.post(`/user/${userId}/sync`);
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/user/${userId}`);
    return response.data;
  },

  // Route
  getRoutePoints: async (routeId?: number): Promise<RoutePoint[]> => {
    const params = routeId ? { routeId } : {};
    const response = await apiClient.get<RoutePoint[]>("/route", { params });
    return response.data;
  },

  getRouteLength: async (routeId?: number): Promise<number> => {
    const params = routeId ? { routeId } : {};
    const response = await apiClient.get<{ lengthKm: number }>(
      "/route/length",
      { params }
    );
    return response.data.lengthKm;
  },

  getRoutes: async (): Promise<Route[]> => {
    const response = await apiClient.get<Route[]>("/route/list");
    return response.data;
  },

  getRoute: async (routeId: number): Promise<Route> => {
    const response = await apiClient.get<Route>(`/route/${routeId}`);
    return response.data;
  },

  // Route Generation
  generateRoute: async (
    request?: GenerateRouteRequest
  ): Promise<RouteGenerationResult> => {
    const response = await apiClient.post<RouteGenerationResult>(
      "/routegeneration/generate",
      request || {}
    );
    return response.data;
  },

  // Challenges
  getChallenge: async (
    challengeId: number,
    userId?: number
  ): Promise<Challenge> => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<Challenge>(
      `/challenge/${challengeId}`,
      { params }
    );
    return response.data;
  },

  getUserChallenges: async (userId: number): Promise<Challenge[]> => {
    const response = await apiClient.get<Challenge[]>(
      `/challenge/user/${userId}`
    );
    return response.data;
  },

  getGroupChallenges: async (groupId: number): Promise<Challenge[]> => {
    const response = await apiClient.get<Challenge[]>(
      `/challenge/group/${groupId}`
    );
    return response.data;
  },

  createChallenge: async (
    creatorUserId: number,
    challenge: CreateChallengeDto
  ): Promise<Challenge> => {
    const response = await apiClient.post<Challenge>("/challenge", {
      creatorUserId,
      challenge,
    });
    return response.data;
  },

  updateChallenge: async (
    challengeId: number,
    userId: number,
    challenge: Partial<CreateChallengeDto>
  ): Promise<Challenge> => {
    const response = await apiClient.put<Challenge>(
      `/challenge/${challengeId}`,
      {
        userId,
        challenge,
      }
    );
    return response.data;
  },

  deleteChallenge: async (
    challengeId: number,
    userId: number
  ): Promise<void> => {
    await apiClient.delete(`/challenge/${challengeId}`, {
      params: { userId },
    });
  },

  joinChallenge: async (challengeId: number, userId: number): Promise<void> => {
    await apiClient.post(`/challenge/${challengeId}/join`, { userId });
  },

  leaveChallenge: async (
    challengeId: number,
    userId: number
  ): Promise<void> => {
    await apiClient.post(`/challenge/${challengeId}/leave`, { userId });
  },

  getUserChallengeProgress: async (
    challengeId: number,
    userId: number
  ): Promise<ChallengeProgress> => {
    const response = await apiClient.get<ChallengeProgress>(
      `/challenge/${challengeId}/progress/${userId}`
    );
    return response.data;
  },

  getGroupChallengeProgress: async (
    challengeId: number,
    userId?: number
  ): Promise<GroupChallengeProgress> => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<GroupChallengeProgress>(
      `/challenge/${challengeId}/progress/group`,
      { params }
    );
    return response.data;
  },

  updateChallengeProgress: async (
    challengeId: number,
    userId: number
  ): Promise<void> => {
    await apiClient.post(`/challenge/${challengeId}/update-progress/${userId}`);
  },

  getChallengeLeaderboard: async (
    challengeId: number,
    userId?: number
  ): Promise<Leaderboard> => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<Leaderboard>(
      `/challenge/${challengeId}/leaderboard`,
      { params }
    );
    return response.data;
  },

  getInterGroupLeaderboard: async (
    challengeId: number,
    userId?: number
  ): Promise<InterGroupLeaderboard> => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<InterGroupLeaderboard>(
      `/challenge/${challengeId}/inter-group-leaderboard`,
      { params }
    );
    return response.data;
  },

  syncGroupChallenge: async (challengeId: number): Promise<void> => {
    await apiClient.post(`/challenge/${challengeId}/sync-group`);
  },

  syncInterGroupChallenge: async (challengeId: number): Promise<void> => {
    await apiClient.post(`/challenge/${challengeId}/sync-inter-group`);
  },

  // Groups
  getGroup: async (groupId: number): Promise<Group> => {
    const response = await apiClient.get<Group>(`/group/${groupId}`);
    return response.data;
  },

  getUserGroups: async (userId: number): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>(`/group/user/${userId}`);
    return response.data;
  },

  getAllGroups: async (userId: number): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>(`/group/all`, {
      params: { userId },
    });
    return response.data;
  },

  createGroup: async (
    creatorUserId: number,
    group: CreateGroupDto
  ): Promise<Group> => {
    const response = await apiClient.post<Group>("/group", {
      creatorUserId,
      group,
    });
    return response.data;
  },

  updateGroup: async (
    groupId: number,
    userId: number,
    group: Partial<CreateGroupDto>
  ): Promise<Group> => {
    const response = await apiClient.put<Group>(`/group/${groupId}`, {
      userId,
      group,
    });
    return response.data;
  },

  deleteGroup: async (groupId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/group/${groupId}`, {
      params: { userId },
    });
  },

  getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
    const response = await apiClient.get<GroupMember[]>(
      `/group/${groupId}/members`
    );
    return response.data;
  },

  addGroupMember: async (
    groupId: number,
    adminUserId: number,
    member: AddGroupMemberDto
  ): Promise<GroupMember> => {
    const response = await apiClient.post<GroupMember>(
      `/group/${groupId}/members`,
      {
        adminUserId,
        member,
      }
    );
    return response.data;
  },

  removeGroupMember: async (
    groupId: number,
    memberId: number,
    adminUserId: number
  ): Promise<void> => {
    await apiClient.delete(`/group/${groupId}/members/${memberId}`, {
      params: { adminUserId },
    });
  },

  updateMemberRole: async (
    groupId: number,
    memberId: number,
    adminUserId: number,
    newRole: string
  ): Promise<void> => {
    await apiClient.put(`/group/${groupId}/members/${memberId}/role`, {
      adminUserId,
      newRole,
    });
  },
};
