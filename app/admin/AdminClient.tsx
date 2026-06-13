"use client";

import { useState } from "react";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminResultForm from "@/components/AdminResultForm";
import type { Match } from "@/lib/types";

interface AdminClientProps {
  initialMatches: Match[];
}

export default function AdminClient({ initialMatches }: AdminClientProps) {
  const [matches, setMatches] = useState(initialMatches);

  async function refreshMatches() {
    const res = await fetch("/api/matches");
    const data = await res.json();
    if (res.ok) {
      setMatches(data.matches);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este partido?")) return;

    const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error al eliminar");
      return;
    }
    await refreshMatches();
  }

  const futureMatches = matches.filter((m) => !m.scored);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Panel de administración
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminMatchForm onCreated={refreshMatches} />
        <AdminResultForm matches={matches} onUpdated={refreshMatches} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Partidos programados
        </h2>

        {futureMatches.length === 0 ? (
          <p className="text-sm text-gray-500">No hay partidos programados.</p>
        ) : (
          <div className="space-y-2">
            {futureMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(match.startTime).toLocaleString("es-AR")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
