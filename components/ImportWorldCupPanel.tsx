"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-datetime";

interface ImportWorldCupPanelProps {
  existingMatchCount: number;
  onImported: () => void;
}

interface BaselineStatus {
  established: boolean;
  establishedAt: string | null;
  matchCount: number;
}

export default function ImportWorldCupPanel({
  existingMatchCount,
  onImported,
}: ImportWorldCupPanelProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingBaseline, setConfirmingBaseline] = useState(false);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBaselineStatus() {
      try {
        const res = await fetch("/api/admin/score-baseline");
        if (res.ok) {
          setBaselineStatus(await res.json());
        }
      } catch {
        // ignore — panel sigue usable sin estado de línea base
      }
    }
    loadBaselineStatus();
  }, []);

  function handleReimportClick() {
    setConfirming(true);
    setMessage(null);
    setError(null);
  }

  async function handleImport(force = false) {
    setConfirming(false);
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
      const res = await fetch("/api/matches/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al sincronizar");

      const parts = [];
      if (data.metadataUpdated > 0) {
        parts.push(`${data.metadataUpdated} equipo(s) actualizado(s)`);
      }
      if (data.skipped) {
        setMessage(
          parts.length > 0
            ? `Sin partidos activos. ${parts.join(", ")}.`
            : "Sin partidos activos para sincronizar ahora."
        );
      } else {
        if (data.scored > 0) parts.push(`${data.scored} finalizado(s)`);
        if (data.liveUpdated > 0) {
          parts.push(`${data.liveUpdated} actualizado(s) en vivo`);
        }
        setMessage(
          parts.length > 0
            ? `Sincronizado: ${parts.join(", ")}.`
            : "Sincronización completada sin cambios."
        );
      }
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sincronizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleEstablishBaseline() {
    setConfirmingBaseline(false);
    setBaselineLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/score-baseline", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al establecer línea base");
      }

      setBaselineStatus({
        established: true,
        establishedAt: data.establishedAt,
        matchCount: data.matchCount,
      });
      setMessage(
        `Línea base establecida: ${data.userCount} usuario(s), ${data.matchCount} partido(s) congelado(s).`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al establecer línea base"
      );
    } finally {
      setBaselineLoading(false);
    }
  }

  const isBusy = loading || baselineLoading;

  return (
    <div className="space-y-6">
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Mundial FIFA 2026</CardTitle>
        <CardDescription>
          Importa los 104 partidos desde Open Football. Los resultados se
          sincronizan automáticamente cada 5 min en días de partido.
          Reimportar actualiza el fixture y recalcula puntajes conservando
          todos los pronósticos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {existingMatchCount === 0 ? (
            <Button
              className="h-11 w-full sm:w-auto"
              onClick={() => handleImport(false)}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Importar 104 partidos"}
            </Button>
          ) : (
            <>
              <Button
                className="h-11 w-full sm:w-auto"
                onClick={handleReimportClick}
              disabled={loading || confirming || baselineLoading}
            >
              {loading ? "Procesando..." : "Reimportar Mundial 2026"}
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full sm:w-auto"
              onClick={handleSyncResults}
              disabled={loading || confirming || baselineLoading}
            >
                Sincronizar resultados
              </Button>
            </>
          )}
        </div>

        {confirming && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-3">
              <p className="font-semibold">
                ⚠️ ¿Confirmar reimportación del Mundial 2026?
              </p>
              <p className="text-sm">
                Esta acción reemplazará los 104 partidos y recalculará todos
                los puntajes. Los pronósticos guardados se conservan, pero
                la operación no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleImport(true)}
                  disabled={loading}
                >
                  Sí, reimportar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirming(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

    <Card>
      <CardHeader>
        <CardTitle>Línea base de puntajes</CardTitle>
        <CardDescription>
          Congela los puntajes actuales del ranking y los partidos ya
          finalizados. A partir de aquí solo sumarán puntos de partidos nuevos
          según pronósticos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {baselineStatus?.established && baselineStatus.establishedAt && (
          <Alert>
            <AlertDescription className="text-sm">
              Línea base activa desde{" "}
              {formatDateTime(baselineStatus.establishedAt)} (
              {baselineStatus.matchCount} partido
              {baselineStatus.matchCount === 1 ? "" : "s"} congelado
              {baselineStatus.matchCount === 1 ? "" : "s"}). Re-establecerla
              actualizará el snapshot con los totales actuales.
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant="secondary"
          className="h-11 w-full sm:w-auto"
          onClick={() => {
            setConfirmingBaseline(true);
            setMessage(null);
            setError(null);
          }}
          disabled={isBusy || confirmingBaseline}
        >
          {baselineLoading
            ? "Procesando..."
            : baselineStatus?.established
              ? "Re-establecer línea base"
              : "Establecer línea base de puntajes"}
        </Button>

        {confirmingBaseline && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-3">
              <p className="font-semibold">
                ¿Confirmar línea base de puntajes?
              </p>
              <p className="text-sm">
                Se congelarán los puntajes actuales de todos los usuarios y
                los partidos ya finalizados. Los puntos de partidos futuros se
                sumarán encima, sin borrar lo ya contabilizado.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleEstablishBaseline}
                  disabled={baselineLoading}
                >
                  Sí, establecer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmingBaseline(false)}
                  disabled={baselineLoading}
                >
                  Cancelar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
