import { NextResponse } from "next/server";
import { z } from "zod";
import { updateState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { scoreMatch } from "@/lib/scoring";

const resultSchema = z.object({
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = resultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { homeScore, awayScore } = parsed.data;

    const state = await updateState((s) => {
      const match = s.matches.find((m) => m.id === id);
      if (!match) {
        throw new Error("Partido no encontrado");
      }
      if (match.scored) {
        throw new Error("El partido ya tiene resultado cargado");
      }
      scoreMatch(s, id, homeScore, awayScore);
    });

    const match = state.matches.find((m) => m.id === id);
    return NextResponse.json({ match });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar resultado";
    const status = message.includes("no encontrado") ? 404 : 400;
    console.error("Update match result error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    await updateState((s) => {
      const matchIndex = s.matches.findIndex((m) => m.id === id);
      if (matchIndex === -1) {
        throw new Error("Partido no encontrado");
      }
      const match = s.matches[matchIndex];
      if (match.scored) {
        throw new Error("No se puede eliminar un partido con resultado cargado");
      }
      s.matches.splice(matchIndex, 1);
      s.predictions = s.predictions.filter((p) => p.matchId !== id);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar partido";
    console.error("Delete match error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
