import { NextResponse } from "next/server";
import { z } from "zod";
import { getState, updateState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMatchLocked } from "@/lib/scoring";

const predictionSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
});

export async function GET() {
  try {
    const session = await getSession();
    const state = await getState();

    const predictions = session
      ? state.predictions.filter((p) => p.userId === session.userId)
      : [];

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Error al obtener pronósticos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para pronosticar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = predictionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { matchId, homeScore, awayScore } = parsed.data;

    const state = await updateState((s) => {
      const match = s.matches.find((m) => m.id === matchId);
      if (!match) {
        throw new Error("Partido no encontrado");
      }
      if (isMatchLocked(match)) {
        throw new Error("El partido ya comenzó, no se puede modificar el pronóstico");
      }

      const existing = s.predictions.find(
        (p) => p.userId === session.userId && p.matchId === matchId
      );

      if (existing) {
        existing.homeScore = homeScore;
        existing.awayScore = awayScore;
      } else {
        s.predictions.push({
          id: crypto.randomUUID(),
          userId: session.userId,
          matchId,
          homeScore,
          awayScore,
        });
      }
    });

    const prediction = state.predictions.find(
      (p) => p.userId === session.userId && p.matchId === matchId
    );

    return NextResponse.json({ prediction });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al guardar pronóstico";
    console.error("Save prediction error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
