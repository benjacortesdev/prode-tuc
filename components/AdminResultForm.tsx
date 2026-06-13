"use client";

import { useState } from "react";
import TeamWithFlag from "@/components/TeamWithFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseTeamLabel } from "@/lib/team-flags";
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

  const selectedMatch = pendingMatches.find((m) => m.id === selectedId);

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
      <Card>
        <CardHeader>
          <CardTitle>Cargar resultados</CardTitle>
          <CardDescription>
            No hay partidos pendientes de resultado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar resultados</CardTitle>
        <CardDescription>
          Ingresa el marcador final y se calculan los puntos automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Partido</Label>
            <Select
              value={selectedId}
              onValueChange={(value) => setSelectedId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar partido" />
              </SelectTrigger>
              <SelectContent>
                {pendingMatches.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {parseTeamLabel(m.homeTeam).name} vs{" "}
                    {parseTeamLabel(m.awayTeam).name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMatch && (
            <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 py-4">
              <TeamWithFlag team={selectedMatch.homeTeam} flagSize={24} />
              <span className="text-sm text-muted-foreground">vs</span>
              <TeamWithFlag team={selectedMatch.awayTeam} flagSize={24} />
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <Input
              type="number"
              min={0}
              max={20}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="h-12 w-20 text-center text-lg font-bold"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              max={20}
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="h-12 w-20 text-center text-lg font-bold"
            />
          </div>

          {success && (
            <Alert className="border-primary/30 bg-primary/5">
              <AlertDescription className="text-primary">
                Resultado cargado y puntos calculados
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar resultado y calcular puntos"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
