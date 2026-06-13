"use client";

import { useEffect, useRef, useState } from "react";
import MatchGoalsList from "@/components/MatchGoalsList";
import TeamWithFlag from "@/components/TeamWithFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isMatchLocked, getPredictionDeadline } from "@/lib/scoring";
import { formatDateTime } from "@/lib/format-datetime";
import {
  getDisplayScore,
  getLiveStatusLabel,
  hasPartialScore,
  isLiveMatch,
  isMatchInProgress,
} from "@/lib/match-live";
import type { Match, Prediction } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  canEdit: boolean;
  highlight?: boolean;
  onSave: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
}

export default function MatchCard({
  match,
  prediction,
  canEdit,
  highlight = false,
  onSave,
}: MatchCardProps) {
  const [homeValue, setHomeValue] = useState(
    prediction?.homeScore != null ? String(prediction.homeScore) : ""
  );
  const [awayValue, setAwayValue] = useState(
    prediction?.awayScore != null ? String(prediction.awayScore) : ""
  );
  const [homeDraft, setHomeDraft] = useState("");
  const [awayDraft, setAwayDraft] = useState("");
  const [homeFocused, setHomeFocused] = useState(false);
  const [awayFocused, setAwayFocused] = useState(false);
  const prevHomeValue = useRef(homeValue);
  const prevAwayValue = useRef(awayValue);
  const [locked, setLocked] = useState(() => isMatchLocked(match));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locked) return;

    const deadlineMs = getPredictionDeadline(match.startTime).getTime();
    const delay = deadlineMs - Date.now();
    if (delay <= 0) return;

    const timeout = setTimeout(() => setLocked(true), delay);
    return () => clearTimeout(timeout);
  }, [match.startTime, locked]);

  const editable = canEdit && !locked && !match.scored;
  const playingNow = isMatchInProgress(match);
  const live = isLiveMatch(match);
  const partialScore = hasPartialScore(match);
  const displayScore = getDisplayScore(match);
  const liveLabel = getLiveStatusLabel(match);
  const showScore = partialScore || live || match.scored;
  const showGoals =
    (match.homeGoals?.length ?? 0) > 0 || (match.awayGoals?.length ?? 0) > 0;

  function parseScore(value: string): number {
    if (value === "") return 0;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(20, Math.max(0, parsed));
  }

  function handleScoreChange(
    value: string,
    setter: (next: string) => void
  ) {
    if (value === "" || (/^\d{1,2}$/.test(value) && Number(value) <= 20)) {
      setter(value);
    }
  }

  function handleScoreFocus(
    current: string,
    prevRef: React.MutableRefObject<string>,
    setDraft: (next: string) => void,
    setFocused: (focused: boolean) => void
  ) {
    prevRef.current = current;
    setDraft("");
    setFocused(true);
  }

  function handleScoreBlur(
    draft: string,
    prevRef: React.MutableRefObject<string>,
    setValue: (next: string) => void,
    setFocused: (focused: boolean) => void
  ) {
    setValue(draft === "" ? prevRef.current : draft);
    setFocused(false);
  }

  function getScoreForSave(focused: boolean, draft: string, value: string) {
    return parseScore(focused ? draft : value);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSave(
        match.id,
        getScoreForSave(homeFocused, homeDraft, homeValue),
        getScoreForSave(awayFocused, awayDraft, awayValue)
      );
      if (homeFocused) {
        setHomeValue(homeDraft === "" ? prevHomeValue.current : homeDraft);
        setHomeFocused(false);
      }
      if (awayFocused) {
        setAwayValue(awayDraft === "" ? prevAwayValue.current : awayDraft);
        setAwayFocused(false);
      }
      setMessage("Guardado");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        highlight ? "border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm text-muted-foreground">
          {formatDateTime(match.startTime)}
        </span>
        {live ? (
          <Badge variant="destructive">{liveLabel ?? "En vivo"}</Badge>
        ) : playingNow ? (
          <Badge variant="destructive">En juego</Badge>
        ) : locked ? (
          <Badge variant="secondary">Cerrado</Badge>
        ) : prediction ? (
          <Badge>Pronosticado</Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <TeamWithFlag team={match.homeTeam} />
            {showScore && displayScore.home !== undefined && (
              <p className="mt-2 text-center text-3xl font-bold text-primary">
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
              <p className="mt-2 text-center text-3xl font-bold text-primary">
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

        {editable && (
          <div className="flex items-center justify-center gap-4">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={homeFocused ? homeDraft : homeValue}
              onFocus={() =>
                handleScoreFocus(
                  homeValue,
                  prevHomeValue,
                  setHomeDraft,
                  setHomeFocused
                )
              }
              onBlur={() =>
                handleScoreBlur(
                  homeDraft,
                  prevHomeValue,
                  setHomeValue,
                  setHomeFocused
                )
              }
              onChange={(e) => handleScoreChange(e.target.value, setHomeDraft)}
              className="h-14 w-[4.5rem] text-center text-xl font-bold md:h-12 md:w-16 md:text-lg"
            />
            <span className="text-lg text-muted-foreground">-</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={awayFocused ? awayDraft : awayValue}
              onFocus={() =>
                handleScoreFocus(
                  awayValue,
                  prevAwayValue,
                  setAwayDraft,
                  setAwayFocused
                )
              }
              onBlur={() =>
                handleScoreBlur(
                  awayDraft,
                  prevAwayValue,
                  setAwayValue,
                  setAwayFocused
                )
              }
              onChange={(e) => handleScoreChange(e.target.value, setAwayDraft)}
              className="h-14 w-[4.5rem] text-center text-xl font-bold md:h-12 md:w-16 md:text-lg"
            />
          </div>
        )}

        {!editable && prediction && !match.scored && (
          <p className="text-center text-sm text-muted-foreground">
            Tu pronóstico:{" "}
            <span className="font-semibold text-foreground">
              {prediction.homeScore} - {prediction.awayScore}
            </span>
          </p>
        )}

        {playingNow && partialScore && (
          <p className="text-center text-xs text-muted-foreground">
            Marcador parcial · se actualiza con el sync automático
          </p>
        )}

        {prediction?.points !== undefined && match.scored && (
          <p className="text-center text-sm font-medium text-primary">
            Puntos obtenidos: {prediction.points}
          </p>
        )}

        {message && (
          <Alert className="border-primary/30 bg-primary/5 py-2">
            <AlertDescription className="text-primary">
              {message}
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {editable && (
        <CardFooter className="border-t-0 pt-0">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 w-full text-base md:h-9 md:text-sm"
            size="lg"
          >
            {saving ? "Guardando..." : "Guardar pronóstico"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
