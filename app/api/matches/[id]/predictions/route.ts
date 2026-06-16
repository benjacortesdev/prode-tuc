import { NextResponse } from "next/server";
import { getState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildMatchPredictions, isMatchLocked } from "@/lib/scoring";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para ver los pronósticos" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const state = await getState();
    const match = state.matches.find((m) => m.id === id);

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    if (!isMatchLocked(match)) {
      return NextResponse.json(
        { error: "Los pronósticos se publican 2 minutos antes del inicio" },
        { status: 403 }
      );
    }

    const predictions = buildMatchPredictions(state, id);
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Get match predictions error:", error);
    return NextResponse.json(
      { error: "Error al obtener pronósticos del partido" },
      { status: 500 }
    );
  }
}
