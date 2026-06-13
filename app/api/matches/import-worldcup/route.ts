import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getState, setState } from "@/lib/db";
import { scoreMatch } from "@/lib/scoring";
import {
  importWorldCup2026Matches,
  WORLD_CUP_API_SOURCES,
} from "@/lib/worldcup";

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
    const { matches: imported, source, withResults } =
      await importWorldCup2026Matches();
    const importedMap = new Map(imported.map((m) => [m.id, m]));

    if (mode === "sync-results") {
      let updated = 0;

      for (const match of state.matches) {
        const fresh = importedMap.get(match.id);
        if (
          !fresh?.scored ||
          fresh.homeScore === undefined ||
          fresh.awayScore === undefined
        ) {
          continue;
        }
        if (match.scored) continue;

        scoreMatch(state, match.id, fresh.homeScore, fresh.awayScore);
        updated++;
      }

      await setState(state);

      return NextResponse.json({
        ok: true,
        mode: "sync-results",
        updated,
        totalMatches: state.matches.length,
      });
    }

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

    if (force) {
      state.predictions = [];
      for (const user of state.users) {
        user.totalPoints = 0;
        user.exactScores = 0;
      }
    }

    state.matches = imported;

    for (const match of imported) {
      if (
        match.scored &&
        match.homeScore !== undefined &&
        match.awayScore !== undefined
      ) {
        scoreMatch(state, match.id, match.homeScore, match.awayScore);
      }
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
