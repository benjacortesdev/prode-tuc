import { isMatchLocked } from "./scoring";
import type { Match } from "./types";

const MATCH_DURATION_MS = 115 * 60 * 1000;

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE"]);

export function isMatchInProgress(match: Match): boolean {
  if (match.scored) return false;

  const now = Date.now();
  const kickoff = new Date(match.startTime).getTime();
  return now >= kickoff && now <= kickoff + MATCH_DURATION_MS;
}

export function hasPartialScore(match: Match): boolean {
  return (
    match.liveHomeScore !== undefined && match.liveAwayScore !== undefined
  );
}

export function isLiveMatch(match: Match): boolean {
  if (match.scored) return false;

  if (match.matchStatus && LIVE_STATUSES.has(match.matchStatus)) {
    return true;
  }

  if (match.matchStatus === "LIVE" || match.matchStatus === "HT") {
    return true;
  }

  return isMatchInProgress(match) && hasPartialScore(match);
}

export function hasLiveMatches(matches: Match[]): boolean {
  return matches.some((m) => isLiveMatch(m) || isMatchInProgress(m));
}

export function getCurrentMatch(matches: Match[]): Match | undefined {
  const candidates = matches.filter(
    (match) => isMatchInProgress(match) || isLiveMatch(match)
  );

  if (candidates.length === 0) return undefined;

  return candidates.sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0];
}

export function getDisplayScore(match: Match): {
  home?: number;
  away?: number;
} {
  if (match.scored) {
    return { home: match.homeScore, away: match.awayScore };
  }

  if (hasPartialScore(match)) {
    return { home: match.liveHomeScore, away: match.liveAwayScore };
  }

  return {};
}

export function getLiveStatusLabel(match: Match): string | null {
  if (match.scored) return null;

  if (match.matchStatus && LIVE_STATUSES.has(match.matchStatus)) {
    const labels: Record<string, string> = {
      "1H": "1er tiempo",
      HT: "Entretiempo",
      "2H": "2do tiempo",
      ET: "Alargue",
      BT: "Entretiempo alargue",
      P: "Penales",
      LIVE: "En vivo",
    };
    return labels[match.matchStatus] ?? "En vivo";
  }

  if (match.matchStatus === "HT") return "Entretiempo";
  if (match.matchStatus === "LIVE") return "En vivo";

  if (isMatchInProgress(match)) {
    return hasPartialScore(match) ? "En vivo" : "En juego";
  }

  if (isMatchLocked(match) && hasPartialScore(match)) {
    return "En vivo";
  }

  return null;
}
