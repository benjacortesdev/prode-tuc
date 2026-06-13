"use client";

import { useState } from "react";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import MatchResultCard from "@/components/MatchResultCard";
import PageHeader from "@/components/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Match, Prediction } from "@/lib/types";

const PAGE_SIZE = 10;

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
  const [upcomingPages, setUpcomingPages] = useState(1);
  const [finishedPages, setFinishedPages] = useState(1);

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
  const finished = matches
    .filter((m) => m.scored)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const visibleUpcoming = upcoming.slice(0, upcomingPages * PAGE_SIZE);
  const visibleFinished = finished.slice(0, finishedPages * PAGE_SIZE);
  const hasMoreUpcoming = visibleUpcoming.length < upcoming.length;
  const hasMoreFinished = visibleFinished.length < finished.length;

  return (
    <div>
      <PageHeader
        title="Mundial 2026"
        description="Arriesga el marcador exacto. 3 pts exacto, 1 pt tendencia, 0 pts si fallas. Cierra 2 min antes de cada partido."
      />

      {!isLoggedIn && (
        <Alert className="mb-6">
          <AlertDescription>
            <Link href="/login" className="font-medium text-primary underline">
              Inicia sesión
            </Link>{" "}
            para guardar tus pronósticos.
          </AlertDescription>
        </Alert>
      )}

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Todavía no hay partidos cargados.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="mb-5 grid h-auto w-full grid-cols-2 md:mb-6 md:inline-flex md:w-auto">
            <TabsTrigger value="predictions" className="gap-2">
              Pronósticos
              {upcoming.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {upcoming.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              Resultados
              {finished.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {finished.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay partidos pendientes de pronosticar.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {visibleUpcoming.map((match) => {
                    const prediction = predictions.find(
                      (p) => p.matchId === match.id
                    );
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

                {hasMoreUpcoming && (
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {visibleUpcoming.length} de {upcoming.length}
                    </p>
                    <Button
                      variant="outline"
                      className="h-11 w-full md:w-auto"
                      onClick={() => setUpcomingPages((p) => p + 1)}
                    >
                      Cargar más partidos
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {finished.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Todavía no hay resultados cargados.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3">
                  {visibleFinished.map((match) => (
                    <MatchResultCard
                      key={match.id}
                      match={match}
                      prediction={predictions.find((p) => p.matchId === match.id)}
                    />
                  ))}
                </div>

                {hasMoreFinished && (
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {visibleFinished.length} de {finished.length}
                    </p>
                    <Button
                      variant="outline"
                      className="h-11 w-full md:w-auto"
                      onClick={() => setFinishedPages((p) => p + 1)}
                    >
                      Cargar más resultados
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
