export interface User {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  isAdmin: boolean;
  totalPoints: number;
  exactScores: number;
  baselinePoints?: number;
  baselineExactScores?: number;
  createdAt: string;
}

export interface MatchGoal {
  player: string;
  minute: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeScore?: number;
  awayScore?: number;
  scored: boolean;
  liveHomeScore?: number;
  liveAwayScore?: number;
  matchStatus?: string;
  homeGoals?: MatchGoal[];
  awayGoals?: MatchGoal[];
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
}

export interface ScoreBaseline {
  establishedAt: string;
  matchIds: string[];
}

export interface ProdeState {
  users: User[];
  matches: Match[];
  predictions: Prediction[];
  scoreBaseline?: ScoreBaseline;
}

export interface SessionUser {
  userId: string;
  email: string;
  nickname: string;
  isAdmin: boolean;
}

export interface LeaderboardEntry {
  position: number;
  nickname: string;
  totalPoints: number;
  exactScores: number;
}

export interface MatchPredictionEntry {
  nickname: string;
  homeScore: number;
  awayScore: number;
  points?: number;
}
