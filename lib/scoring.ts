import type { ProdeState } from "./types";

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

export function isMatchLocked(match: { startTime: string }): boolean {
  return new Date(match.startTime) <= new Date();
}

export function recalculateUserScores(state: ProdeState, userId: string): void {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return;

  const scoredMatchIds = new Set(
    state.matches.filter((m) => m.scored).map((m) => m.id)
  );

  const userPredictions = state.predictions.filter(
    (p) => p.userId === userId && scoredMatchIds.has(p.matchId)
  );

  user.totalPoints = userPredictions.reduce(
    (sum, p) => sum + (p.points ?? 0),
    0
  );
  user.exactScores = userPredictions.filter((p) => p.points === 3).length;
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
