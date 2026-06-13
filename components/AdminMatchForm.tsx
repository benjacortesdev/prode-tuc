"use client";

import { useState } from "react";

interface AdminMatchFormProps {
  onCreated: () => void;
}

export default function AdminMatchForm({ onCreated }: AdminMatchFormProps) {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          startTime: new Date(startTime).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al crear partido");
      }

      setHomeTeam("");
      setAwayTeam("");
      setStartTime("");
      setSuccess(true);
      onCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear partido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Crear partido</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Equipo local</label>
          <input
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Boca"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Equipo visitante</label>
          <input
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="River"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-600">Fecha y hora</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear partido"}
      </button>

      {success && (
        <p className="mt-2 text-sm text-emerald-600">Partido creado correctamente</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
