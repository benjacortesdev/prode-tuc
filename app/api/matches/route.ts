import { NextResponse } from "next/server";
import { z } from "zod";
import { getState, setState } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createMatchSchema = z.object({
  homeTeam: z.string().min(1, "Equipo local requerido").max(50),
  awayTeam: z.string().min(1, "Equipo visitante requerido").max(50),
  startTime: z.string().min(1, "Fecha y hora requerida"),
});

export async function GET() {
  try {
    const state = await getState();
    const matches = [...state.matches].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json(
      { error: "Error al obtener partidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { homeTeam, awayTeam, startTime } = parsed.data;
    const startDate = new Date(startTime);

    if (startDate <= new Date()) {
      return NextResponse.json(
        { error: "La fecha del partido debe ser futura" },
        { status: 400 }
      );
    }

    const state = await getState();
    const match = {
      id: crypto.randomUUID(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      startTime: startDate.toISOString(),
      scored: false,
    };

    state.matches.push(match);
    await setState(state);

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error("Create match error:", error);
    return NextResponse.json(
      { error: "Error al crear partido" },
      { status: 500 }
    );
  }
}
