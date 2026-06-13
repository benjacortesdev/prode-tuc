"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";

interface AdminResultFormProps {
  matches: Match[];
  onUpdated: () => void;
}

export default function AdminResultForm({
  matches,
  onUpdated,
}: AdminResultFormProps) {
  const pendingMatches = matches.filter(
    (m) => !m.scored && new Date(m.startTime) <= new Date()
  );

  const [selectedId, setSelectedId] = useState(pendingMatches[0]?.id ?? "");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/matches/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore, awayScore }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al cargar resultado");
      }

      setHomeScore(0);
      setAwayScore(0);
      setSuccess(true);
      onUpdated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar resultado");
    } finally {
      setLoading(false);
    }
  }

  if (pendingMatches.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Cargar resultados
        </h2>
        <p className="text-sm text-gray-500">
          No hay partidos pendientes de resultado.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Cargar resultados
      </h2>

      <div className="mb-3">
        <label className="mb-1 block text-sm text-gray-600">Partido</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {pendingMatches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.homeTeam} vs {m.awayTeam}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-center gap-3">
        <input
          type="number"
          min={0}
          max={20}
          value={homeScore}
          onChange={(e) => setHomeScore(Number(e.target.value))}
          className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-center text-lg font-bold"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          min={0}
          max={20}
          value={awayScore}
          onChange={(e) => setAwayScore(Number(e.target.value))}
          className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-center text-lg font-bold"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar resultado y calcular puntos"}
      </button>

      {success && (
        <p className="mt-2 text-sm text-emerald-600">
          Resultado cargado y puntos calculados
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
