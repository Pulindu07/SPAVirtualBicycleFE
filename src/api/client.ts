import axios from "axios";
import type { RoutePoint, UserProgress } from "../types";

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

  // Route
  getRoutePoints: async (): Promise<RoutePoint[]> => {
    const response = await apiClient.get<RoutePoint[]>("/route");
    return response.data;
  },

  getRouteLength: async (): Promise<number> => {
    const response = await apiClient.get<{ lengthKm: number }>("/route/length");
    return response.data.lengthKm;
  },
};
