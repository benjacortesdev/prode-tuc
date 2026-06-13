"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminResultForm from "@/components/AdminResultForm";
import ImportWorldCupPanel from "@/components/ImportWorldCupPanel";
import TeamWithFlag from "@/components/TeamWithFlag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <PageHeader
        title="Panel de administración"
        description="Gestiona partidos, resultados y el fixture del Mundial"
      />

      <ImportWorldCupPanel
        existingMatchCount={matches.length}
        onImported={refreshMatches}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminMatchForm onCreated={refreshMatches} />
        <AdminResultForm matches={matches} onUpdated={refreshMatches} />
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Partidos programados</h2>

        {futureMatches.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No hay partidos programados.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {futureMatches.map((match) => (
              <Card key={match.id} size="sm">
                <CardContent className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <TeamWithFlag team={match.homeTeam} flagSize={20} />
                      <span className="text-sm text-muted-foreground">vs</span>
                      <TeamWithFlag team={match.awayTeam} flagSize={20} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(match.startTime).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(match.id)}
                  >
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
