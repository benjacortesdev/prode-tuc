import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getState, setState } from "@/lib/db";
import { scoreMatch, recalculateUserScores } from "@/lib/scoring";
import {
  importWorldCup2026Matches,
  WORLD_CUP_API_SOURCES,
} from "@/lib/worldcup";
import { syncWorldCupResults } from "@/lib/worldcup-sync";

export async function GET() {
  return NextResponse.json({
    apis: WORLD_CUP_API_SOURCES,
    defaultSource: "openfootball",
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body.mode ?? "import";
    const force = Boolean(body.force);

    const state = await getState();

    if (mode === "sync-results") {
      const result = await syncWorldCupResults(state, { force: true });
      await setState(state);
      return NextResponse.json({
        ok: true,
        mode: "sync-results",
        ...result,
      });
    }

    const { matches: imported, source, withResults } =
      await importWorldCup2026Matches();

    if (state.matches.length > 0 && !force) {
      return NextResponse.json(
        {
          error:
            "Ya hay partidos cargados. Usa force: true para reemplazar, o mode: 'sync-results' para actualizar resultados.",
          existingCount: state.matches.length,
        },
        { status: 409 }
      );
    }

    // Reemplazar los partidos sin tocar las predicciones existentes.
    // Los IDs son estables (wc2026-N), así que los pronósticos guardados
    // siguen apuntando a los mismos partidos tras la reimportación.
    state.matches = imported;

    // Re-puntuar predicciones para partidos que ya tienen resultado.
    for (const match of imported) {
      if (
        match.scored &&
        match.homeScore !== undefined &&
        match.awayScore !== undefined
      ) {
        scoreMatch(state, match.id, match.homeScore, match.awayScore);
      }
    }

    // Pase final: recalcular totales de todos los usuarios para asegurar
    // consistencia con el nuevo fixture (cubre partidos sin resultado también).
    for (const user of state.users) {
      recalculateUserScores(state, user.id);
    }

    await setState(state);

    return NextResponse.json({
      ok: true,
      mode: "import",
      imported: imported.length,
      withResults,
      source,
    });
  } catch (error) {
    console.error("World Cup import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al importar Mundial 2026",
      },
      { status: 500 }
    );
  }
}
