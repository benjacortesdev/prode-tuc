import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getState, updateState } from "@/lib/db";
import { establishScoreBaseline } from "@/lib/scoring";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const state = await getState();
    const baseline = state.scoreBaseline;

    return NextResponse.json({
      established: Boolean(baseline),
      establishedAt: baseline?.establishedAt ?? null,
      matchCount: baseline?.matchIds.length ?? 0,
    });
  } catch (error) {
    console.error("Get score baseline error:", error);
    return NextResponse.json(
      { error: "Error al consultar línea base" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    let result: ReturnType<typeof establishScoreBaseline> | undefined;

    await updateState((state) => {
      result = establishScoreBaseline(state);
    });

    if (!result) {
      return NextResponse.json(
        { error: "Error al establecer línea base de puntajes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Establish score baseline error:", error);
    return NextResponse.json(
      { error: "Error al establecer línea base de puntajes" },
      { status: 500 }
    );
  }
}
