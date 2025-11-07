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

// User types
export interface User {
  id: number;
  stravaId: number;
  username: string;
  firstName: string;
  lastName: string;
  totalDistanceKm: number;
  totalMovingTimeSec: number;
  lastSync: string;
  createdAt: string;
  isActive: boolean;
  isSuperAdmin: boolean;
}

// Route types
export interface Route {
  id: number;
  name: string;
  description?: string;
  totalDistanceKm: number;
  createdAt: string;
  isActive: boolean;
}

// Group types
export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string; // "admin" or "member"
  joinedAt: string;
  totalDistanceKm: number;
}

export interface Group {
  id: number;
  name: string;
  iconUrl?: string;
  createdByUserId: number;
  createdByUsername: string;
  createdAt: string;
  memberCount: number;
  members: GroupMember[];
}

export interface CreateGroupDto {
  name: string;
  iconUrl?: string;
}

export interface AddGroupMemberDto {
  userId: number;
  role: string; // "admin" or "member"
}

// Challenge types
export interface ChallengeGroup {
  groupId: number;
  groupName: string;
  groupIconUrl?: string;
  joinedAt: string;
  totalDistanceCovered: number;
  progressPercentage: number;
  memberCount: number;
  rank: number;
  currentPositionLat?: number; // For map display
  currentPositionLng?: number; // For map display
}

export interface Challenge {
  id: number;
  name: string;
  description?: string;
  targetDistanceKm: number;
  startDate: string;
  endDate: string;
  challengeType: string; // "individual", "group", or "inter-group"
  routeId?: number;
  participatingGroups: ChallengeGroup[];
  createdByUserId: number;
  createdByUsername: string;
  createdAt: string;
  participantCount: number;
  groupCount: number; // Number of participating groups (for inter-group challenges)
  totalDistanceCovered: number;
  progressPercentage: number;
  status: string; // "upcoming", "in_progress", "completed"
  daysRemaining: number;
}

export interface CreateChallengeDto {
  name: string;
  description?: string;
  targetDistanceKm: number;
  startDate: string;
  endDate: string;
  challengeType: string; // "individual", "group", or "inter-group"
  groupIds: number[];
  routeId?: number;
}

export interface ChallengeProgress {
  challengeId: number;
  challengeName: string;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  distanceCoveredKm: number;
  progressPercentage: number;
  currentPositionLat?: number;
  currentPositionLng?: number;
  lastActivityDate?: string;
  updatedAt: string;
  rank: number;
}

export interface GroupChallengeProgress {
  challengeId: number;
  challengeName: string;
  targetDistanceKm: number;
  totalDistanceCovered: number;
  progressPercentage: number;
  currentPositionLat?: number;
  currentPositionLng?: number;
  memberProgress: ChallengeProgress[];
  lastActivityDate?: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  distanceCoveredKm: number;
  progressPercentage: number;
  lastActivityDate?: string;
  isCurrentUser: boolean;
  currentPositionLat?: number;
  currentPositionLng?: number;
}

export interface Leaderboard {
  challengeId: number;
  challengeName: string;
  targetDistanceKm: number;
  challengeType: string;
  entries: LeaderboardEntry[];
}

export interface InterGroupLeaderboard {
  challengeId: number;
  challengeName: string;
  targetDistanceKm: number;
  groupRankings: ChallengeGroup[];
  userGroupMemberRankings?: LeaderboardEntry[]; // Within user's group
  userGroupId?: number;
  userGroupName?: string;
}

// Route Generation types
export interface Waypoint {
  latitude: number;
  longitude: number;
}

export interface GenerateRouteRequest {
  routeId?: number;
  routeName?: string;
  routeDescription?: string;
  waypoints?: Waypoint[];
}

export interface RouteGenerationResult {
  routeId: number;
  routeName: string;
  totalDistanceKm: number;
  pointCount: number;
}
