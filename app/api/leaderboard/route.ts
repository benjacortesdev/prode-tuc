import { NextResponse } from "next/server";
import { getState } from "@/lib/db";
import { buildLeaderboard } from "@/lib/scoring";

export async function GET() {
  try {
    const state = await getState();
    const leaderboard = buildLeaderboard(state);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Error al obtener el ranking" },
      { status: 500 }
    );
  }
}
