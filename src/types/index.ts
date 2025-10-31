export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface UserProgress {
  totalDistanceKm: number;
  totalMovingTimeSec: number;
  progressPercent: number;
  currentLat: number;
  currentLng: number;
  lastSync: string;
  username: string;
  firstName: string;
  lastName: string;
}
