import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getState } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const state = await getState();
    const user = state.users.find((u) => u.id === session.userId);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        totalPoints: user.totalPoints,
        exactScores: user.exactScores,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}
