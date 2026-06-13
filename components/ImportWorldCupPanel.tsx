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
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Mundial FIFA 2026</CardTitle>
        <CardDescription>
          Importa los 104 partidos desde Open Football (fixture + resultados).
          Sin API key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {existingMatchCount === 0 ? (
            <Button onClick={() => handleImport(false)} disabled={loading}>
              {loading ? "Procesando..." : "Importar 104 partidos"}
            </Button>
          ) : (
            <>
              <Button onClick={() => handleImport(true)} disabled={loading}>
                {loading ? "Procesando..." : "Reimportar Mundial 2026"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSyncResults}
                disabled={loading}
              >
                Sincronizar resultados
              </Button>
            </>
          )}
        </div>

        {message && (
          <Alert className="border-primary/30 bg-primary/10">
            <AlertDescription className="text-primary">{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
