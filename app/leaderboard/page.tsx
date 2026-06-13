import { getState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildLeaderboard } from "@/lib/scoring";
import LeaderboardTable from "@/components/LeaderboardTable";

export default async function LeaderboardPage() {
  const state = await getState();
  const session = await getSession();
  const entries = buildLeaderboard(state);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Tabla de posiciones
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Ordenado por puntos totales. En caso de empate, gana quien tenga más
        marcadores exactos.
      </p>

      <LeaderboardTable
        entries={entries}
        highlightNickname={session?.nickname}
      />
    </div>
  );
}
