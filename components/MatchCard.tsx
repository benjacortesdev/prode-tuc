"use client";

import { useEffect, useState } from "react";
import TeamWithFlag from "@/components/TeamWithFlag";
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
  const [locked, setLocked] = useState(
    () => new Date(match.startTime) <= new Date()
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locked) return;

    const startMs = new Date(match.startTime).getTime();
    const delay = startMs - Date.now();
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500">{formatDateTime(match.startTime)}</span>
        {locked || match.scored ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            Cerrado
          </span>
        ) : prediction ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Pronosticado
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <TeamWithFlag team={match.homeTeam} />
          {match.scored && (
            <p className="mt-1 text-center text-2xl font-bold text-emerald-700">
              {match.homeScore}
            </p>
          )}
        </div>

        <div className="text-gray-400 font-medium shrink-0">vs</div>

        <div className="flex-1">
          <TeamWithFlag team={match.awayTeam} />
          {match.scored && (
            <p className="mt-1 text-center text-2xl font-bold text-emerald-700">
              {match.awayScore}
            </p>
          )}
        </div>
      </div>

      {editable && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <input
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-lg font-bold"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-lg font-bold"
          />
        </div>
      )}

      {!editable && prediction && !match.scored && (
        <p className="mt-3 text-center text-sm text-gray-600">
          Tu pronóstico: {prediction.homeScore} - {prediction.awayScore}
        </p>
      )}

      {prediction?.points !== undefined && match.scored && (
        <p className="mt-3 text-center text-sm font-medium text-emerald-700">
          Puntos obtenidos: {prediction.points}
        </p>
      )}

      {editable && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar pronóstico"}
        </button>
      )}

      {message && (
        <p className="mt-2 text-center text-sm text-emerald-600">{message}</p>
      )}
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
