"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MatchGoalsList from "@/components/MatchGoalsList";
import MatchPredictionsList from "@/components/MatchPredictionsList";
import TeamWithFlag from "@/components/TeamWithFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-datetime";
import {
  getDisplayScore,
  getLiveStatusLabel,
  hasPartialScore,
  isLiveMatch,
  isMatchInProgress,
} from "@/lib/match-live";
import { getPredictionDeadline } from "@/lib/scoring";
import type { Match, MatchPredictionEntry, Prediction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchDetailClientProps {
  initialMatch: Match;
  userPrediction?: Prediction;
  publishedPredictions: MatchPredictionEntry[] | null;
  isLoggedIn: boolean;
  isLocked: boolean;
  highlightNickname?: string;
}

export default function MatchDetailClient({
  initialMatch,
  userPrediction,
  publishedPredictions: initialPublishedPredictions,
  isLoggedIn,
  isLocked: initialLocked,
  highlightNickname,
}: MatchDetailClientProps) {
  const [match, setMatch] = useState(initialMatch);
  const [locked, setLocked] = useState(initialLocked);
  const [publishedPredictions, setPublishedPredictions] = useState(
    initialPublishedPredictions
  );

  useEffect(() => {
    if (match.scored) return;

    async function refreshMatch() {
      const res = await fetch("/api/matches");
      const data = await res.json();
      if (res.ok) {
        const updated = data.matches.find(
          (m: Match) => m.id === initialMatch.id
        );
        if (updated) {
          setMatch(updated);
        }
      }
    }

    refreshMatch();
    const interval = setInterval(refreshMatch, 30_000);
    return () => clearInterval(interval);
  }, [initialMatch.id, match.scored]);

  useEffect(() => {
    if (locked || !isLoggedIn) return;

    const deadlineMs = getPredictionDeadline(match.startTime).getTime() - Date.now();
    if (deadlineMs <= 0) return;

    const timeout = setTimeout(async () => {
      setLocked(true);
      const res = await fetch(
        `/api/matches/${match.id}/predictions`
      );
      const data = await res.json();
      if (res.ok) {
        setPublishedPredictions(data.predictions);
      }
    }, deadlineMs);

    return () => clearTimeout(timeout);
  }, [locked, isLoggedIn, match.id, match.startTime]);

  const playingNow = isMatchInProgress(match);
  const live = isLiveMatch(match);
  const partialScore = hasPartialScore(match);
  const displayScore = getDisplayScore(match);
  const liveLabel = getLiveStatusLabel(match);
  const showScore = partialScore || live || match.scored;
  const showGoals =
    (match.homeGoals?.length ?? 0) > 0 || (match.awayGoals?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <Link
        href="/predictions"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 text-muted-foreground"
        )}
      >
        ← Volver a pronósticos
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <span className="text-sm text-muted-foreground">
            {formatDateTime(match.startTime)}
          </span>
          {match.scored ? (
            <Badge variant="secondary">Finalizado</Badge>
          ) : live ? (
            <Badge variant="destructive">{liveLabel ?? "En vivo"}</Badge>
          ) : playingNow ? (
            <Badge variant="destructive">En juego</Badge>
          ) : locked ? (
            <Badge variant="secondary">Cerrado</Badge>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <TeamWithFlag team={match.homeTeam} />
              {showScore && displayScore.home !== undefined && (
                <p className="mt-2 text-center text-4xl font-bold text-primary">
                  {displayScore.home}
                </p>
              )}
            </div>

            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              vs
            </span>

            <div className="flex-1">
              <TeamWithFlag team={match.awayTeam} />
              {showScore && displayScore.away !== undefined && (
                <p className="mt-2 text-center text-4xl font-bold text-primary">
                  {displayScore.away}
                </p>
              )}
            </div>
          </div>

          {showGoals && (
            <MatchGoalsList
              homeGoals={match.homeGoals}
              awayGoals={match.awayGoals}
            />
          )}

          {playingNow && partialScore && !match.scored && (
            <p className="text-center text-xs text-muted-foreground">
              Marcador parcial · se actualiza con el sync automático
            </p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pronósticos del grupo
        </h2>

        {!isLoggedIn ? (
          <Alert>
            <AlertDescription>
              <Link href="/login" className="font-medium text-primary underline">
                Inicia sesión
              </Link>{" "}
              para ver los pronósticos de todos los participantes.
            </AlertDescription>
          </Alert>
        ) : locked && publishedPredictions ? (
          <MatchPredictionsList
            predictions={publishedPredictions}
            highlightNickname={highlightNickname}
            showPoints={match.scored}
          />
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Los pronósticos se publican 2 minutos antes del inicio del
                partido.
              </AlertDescription>
            </Alert>
            {userPrediction && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">Tu pronóstico</p>
                  <p className="mt-1 text-2xl font-bold">
                    {userPrediction.homeScore} - {userPrediction.awayScore}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>
    </div>
  );
}
