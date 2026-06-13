import { isMatchInProgress } from "./match-live";
import { scoreMatch } from "./scoring";
import { importWorldCup2026Matches } from "./worldcup";
import type { Match, ProdeState } from "./types";

const PRE_MATCH_WINDOW_MS = 30 * 60 * 1000;
const POST_MATCH_WINDOW_MS = 180 * 60 * 1000;

export interface SyncResult {
  skipped: boolean;
  reason?: string;
  liveUpdated: number;
  scored: number;
}

interface SyncOptions {
  force?: boolean;
}

function shouldSyncNow(matches: Match[]): boolean {
  const now = Date.now();

  return matches.some((match) => {
    if (match.scored) return false;

    const kickoff = new Date(match.startTime).getTime();
    const inWindow =
      now >= kickoff - PRE_MATCH_WINDOW_MS &&
      now <= kickoff + POST_MATCH_WINDOW_MS;

    if (inWindow) return true;

    if (match.matchStatus === "HT" || match.matchStatus === "LIVE") {
      return true;
    }

    return now > kickoff && now - kickoff < 24 * 60 * 60 * 1000;
  });
}

function copyMatchGoals(target: Match, source: Match): boolean {
  const homeChanged =
    JSON.stringify(target.homeGoals) !== JSON.stringify(source.homeGoals);
  const awayChanged =
    JSON.stringify(target.awayGoals) !== JSON.stringify(source.awayGoals);

  if (source.homeGoals?.length) target.homeGoals = source.homeGoals;
  if (source.awayGoals?.length) target.awayGoals = source.awayGoals;

  return homeChanged || awayChanged;
}

export async function syncWorldCupResults(
  state: ProdeState,
  options: SyncOptions = {}
): Promise<SyncResult> {
  if (!options.force && !shouldSyncNow(state.matches)) {
    return {
      skipped: true,
      reason: "no_active_matches",
      liveUpdated: 0,
      scored: 0,
    };
  }

  const { matches: imported } = await importWorldCup2026Matches();
  const importedMap = new Map(imported.map((m) => [m.id, m]));
  let scored = 0;
  let liveUpdated = 0;

  for (const match of state.matches) {
    const fresh = importedMap.get(match.id);
    if (!fresh) continue;

    if (match.scored) {
      copyMatchGoals(match, fresh);
      continue;
    }

    if (
      fresh.scored &&
      fresh.homeScore !== undefined &&
      fresh.awayScore !== undefined
    ) {
      copyMatchGoals(match, fresh);
      scoreMatch(state, match.id, fresh.homeScore, fresh.awayScore);
      scored++;
      continue;
    }

    const goalsChanged = copyMatchGoals(match, fresh);

    if (
      fresh.liveHomeScore !== undefined &&
      fresh.liveAwayScore !== undefined &&
      isMatchInProgress(match)
    ) {
      const changed =
        match.liveHomeScore !== fresh.liveHomeScore ||
        match.liveAwayScore !== fresh.liveAwayScore ||
        match.matchStatus !== fresh.matchStatus ||
        goalsChanged;

      match.liveHomeScore = fresh.liveHomeScore;
      match.liveAwayScore = fresh.liveAwayScore;
      match.matchStatus = fresh.matchStatus ?? "LIVE";

      if (changed) liveUpdated++;
    } else if (goalsChanged && isMatchInProgress(match)) {
      liveUpdated++;
    }
  }

  return {
    skipped: false,
    liveUpdated,
    scored,
  };
}
