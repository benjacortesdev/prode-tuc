import type { MatchPredictionEntry, ProdeState } from "./types";

export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): { points: number; isExact: boolean } {
  if (predHome === realHome && predAway === realAway) {
    return { points: 3, isExact: true };
  }

  const predOutcome =
    predHome > predAway ? "home" : predHome < predAway ? "away" : "draw";
  const realOutcome =
    realHome > realAway ? "home" : realHome < realAway ? "away" : "draw";

  if (predOutcome === realOutcome) {
    return { points: 1, isExact: false };
  }

  return { points: 0, isExact: false };
}

export const PREDICTION_LOCK_MINUTES_BEFORE = 2;

export function getPredictionDeadline(startTime: string): Date {
  return new Date(
    new Date(startTime).getTime() - PREDICTION_LOCK_MINUTES_BEFORE * 60 * 1000
  );
}

export function isMatchLocked(match: { startTime: string }): boolean {
  return getPredictionDeadline(match.startTime) <= new Date();
}

function getBaselineMatchIds(state: ProdeState): Set<string> {
  return new Set(state.scoreBaseline?.matchIds ?? []);
}

export function recalculateUserScores(state: ProdeState, userId: string): void {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return;

  const baselineMatchIds = getBaselineMatchIds(state);
  const scoredMatchIds = new Set(
    state.matches.filter((m) => m.scored).map((m) => m.id)
  );

  const incrementalPredictions = state.predictions.filter(
    (p) =>
      p.userId === userId &&
      scoredMatchIds.has(p.matchId) &&
      !baselineMatchIds.has(p.matchId)
  );

  const incrementalPoints = incrementalPredictions.reduce(
    (sum, p) => sum + (p.points ?? 0),
    0
  );
  const incrementalExactScores = incrementalPredictions.filter(
    (p) => p.points === 3
  ).length;

  user.totalPoints = (user.baselinePoints ?? 0) + incrementalPoints;
  user.exactScores = (user.baselineExactScores ?? 0) + incrementalExactScores;
}

export interface EstablishScoreBaselineResult {
  establishedAt: string;
  userCount: number;
  matchCount: number;
}

export function establishScoreBaseline(
  state: ProdeState
): EstablishScoreBaselineResult {
  const establishedAt = new Date().toISOString();
  const matchIds = state.matches.filter((m) => m.scored).map((m) => m.id);

  for (const user of state.users) {
    user.baselinePoints = user.totalPoints;
    user.baselineExactScores = user.exactScores;
  }

  state.scoreBaseline = { establishedAt, matchIds };

  for (const user of state.users) {
    recalculateUserScores(state, user.id);
  }

  return {
    establishedAt,
    userCount: state.users.length,
    matchCount: matchIds.length,
  };
}

export function scoreMatch(
  state: ProdeState,
  matchId: string,
  homeScore: number,
  awayScore: number
): void {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.scored = true;

  const affectedUserIds = new Set<string>();

  for (const prediction of state.predictions.filter(
    (p) => p.matchId === matchId
  )) {
    const { points } = calculatePoints(
      prediction.homeScore,
      prediction.awayScore,
      homeScore,
      awayScore
    );
    prediction.points = points;
    affectedUserIds.add(prediction.userId);
  }

  for (const userId of affectedUserIds) {
    recalculateUserScores(state, userId);
  }
}

export function buildMatchPredictions(
  state: ProdeState,
  matchId: string
): MatchPredictionEntry[] {
  const userById = new Map(state.users.map((u) => [u.id, u]));

  return state.predictions
    .filter((p) => p.matchId === matchId)
    .map((p) => {
      const user = userById.get(p.userId);
      return {
        nickname: user?.nickname ?? "Desconocido",
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        points: p.points,
      };
    })
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "es"));
}

export function buildLeaderboard(state: ProdeState) {
  const sorted = [...state.users].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.exactScores - a.exactScores;
  });

  return sorted.map((user, index) => ({
    position: index + 1,
    nickname: user.nickname,
    totalPoints: user.totalPoints,
    exactScores: user.exactScores,
  }));
}
