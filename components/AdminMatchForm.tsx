"use client";

import { useState } from "react";
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
    <Card>
      <CardHeader>
        <CardTitle>Crear partido</CardTitle>
        <CardDescription>Agrega un partido manual al torneo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Equipo local</Label>
              <Input
                id="homeTeam"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                required
                placeholder="Boca"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayTeam">Equipo visitante</Label>
              <Input
                id="awayTeam"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                required
                placeholder="River"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="startTime">Fecha y hora</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          {success && (
            <Alert className="border-primary/30 bg-primary/5">
              <AlertDescription className="text-primary">
                Partido creado correctamente
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando..." : "Crear partido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
