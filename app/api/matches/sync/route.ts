import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getState, setState } from "@/lib/db";
import { syncWorldCupResults } from "@/lib/worldcup-sync";

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runSync(force = false) {
  const state = await getState();
  const result = await syncWorldCupResults(state, { force });
  await setState(state);
  return result;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Cron sync error:", error);
    const message =
      error instanceof Error ? error.message : "Error al sincronizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const result = await runSync(true);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Admin sync error:", error);
    const message =
      error instanceof Error ? error.message : "Error al sincronizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
