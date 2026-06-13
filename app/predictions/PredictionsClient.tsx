"use client";

import { useState } from "react";
import MatchCard from "@/components/MatchCard";
import type { Match, Prediction } from "@/lib/types";

interface PredictionsClientProps {
  initialMatches: Match[];
  initialPredictions: Prediction[];
  isLoggedIn: boolean;
}

export default function PredictionsClient({
  initialMatches,
  initialPredictions,
  isLoggedIn,
}: PredictionsClientProps) {
  const [matches] = useState(initialMatches);
  const [predictions, setPredictions] = useState(initialPredictions);

  async function handleSave(
    matchId: string,
    homeScore: number,
    awayScore: number
  ) {
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Error al guardar pronóstico");
    }

    setPredictions((prev) => {
      const existing = prev.find((p) => p.matchId === matchId);
      if (existing) {
        return prev.map((p) =>
          p.matchId === matchId ? { ...p, homeScore, awayScore } : p
        );
      }
      return [...prev, data.prediction];
    });
  }

  const upcoming = matches.filter((m) => !m.scored);
  const finished = matches.filter((m) => m.scored);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Pronósticos</h1>
      <p className="mb-6 text-sm text-gray-600">
        Arriesga el marcador exacto. 3 pts exacto, 1 pt tendencia, 0 pts si fallas.
      </p>

      {!isLoggedIn && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <a href="/login" className="font-medium underline">
            Inicia sesión
          </a>{" "}
          para guardar tus pronósticos.
        </div>
      )}

      {matches.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          Todavía no hay partidos cargados.
        </p>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                Próximos partidos
              </h2>
              <div className="grid gap-4">
                {upcoming.map((match) => {
                  const prediction = predictions.find((p) => p.matchId === match.id);
                  return (
                    <MatchCard
                      key={`${match.id}-${prediction?.homeScore ?? "n"}-${prediction?.awayScore ?? "n"}`}
                      match={match}
                      prediction={prediction}
                      canEdit={isLoggedIn}
                      onSave={handleSave}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                Partidos finalizados
              </h2>
              <div className="grid gap-4">
                {finished.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictions.find((p) => p.matchId === match.id)}
                    canEdit={false}
                    onSave={handleSave}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
