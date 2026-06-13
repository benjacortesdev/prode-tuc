"use client";

import { useEffect, useState } from "react";
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
import type { Match, Prediction } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  canEdit: boolean;
  onSave: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({
  match,
  prediction,
  canEdit,
  onSave,
}: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(prediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.awayScore ?? 0);
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

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSave(match.id, homeScore, awayScore);
      setMessage("Guardado");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm text-muted-foreground">
          {formatDateTime(match.startTime)}
        </span>
        {locked || match.scored ? (
          <Badge variant="secondary">Cerrado</Badge>
        ) : prediction ? (
          <Badge>Pronosticado</Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <TeamWithFlag team={match.homeTeam} />
            {match.scored && (
              <p className="mt-2 text-center text-3xl font-bold text-primary">
                {match.homeScore}
              </p>
            )}
          </div>

          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            vs
          </span>

          <div className="flex-1">
            <TeamWithFlag team={match.awayTeam} />
            {match.scored && (
              <p className="mt-2 text-center text-3xl font-bold text-primary">
                {match.awayScore}
              </p>
            )}
          </div>
        </div>

        {editable && (
          <div className="flex items-center justify-center gap-3">
            <Input
              type="number"
              min={0}
              max={20}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="h-12 w-16 text-center text-lg font-bold"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              max={20}
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="h-12 w-16 text-center text-lg font-bold"
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
            className="w-full"
            size="lg"
          >
            {saving ? "Guardando..." : "Guardar pronóstico"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
