"use client";

import { useState } from "react";

interface ImportWorldCupPanelProps {
  existingMatchCount: number;
  onImported: () => void;
}

export default function ImportWorldCupPanel({
  existingMatchCount,
  onImported,
}: ImportWorldCupPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(force = false) {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/matches/import-worldcup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "import", force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      setMessage(
        `Importados ${data.imported} partidos (${data.withResults} con resultado).`
      );
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncResults() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/matches/import-worldcup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "sync-results" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al sincronizar");
      setMessage(`Resultados actualizados: ${data.updated} partidos.`);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sincronizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Mundial FIFA 2026
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Importa los 104 partidos desde Open Football (fixture + resultados). Sin
        API key.
      </p>

      <div className="flex flex-wrap gap-2">
        {existingMatchCount === 0 ? (
          <button
            onClick={() => handleImport(false)}
            disabled={loading}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Importar 104 partidos"}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleImport(true)}
              disabled={loading}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Reimportar Mundial 2026"}
            </button>
            <button
              onClick={handleSyncResults}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Sincronizar resultados
            </button>
          </>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
