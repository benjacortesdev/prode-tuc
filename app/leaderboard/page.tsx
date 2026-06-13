import { getState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildLeaderboard } from "@/lib/scoring";
import PageHeader from "@/components/PageHeader";
import LeaderboardTable from "@/components/LeaderboardTable";

export default async function LeaderboardPage() {
  const state = await getState();
  const session = await getSession();
  const entries = buildLeaderboard(state);

  return (
    <div>
      <PageHeader
        title="Tabla de posiciones"
        description="Ordenado por puntos totales. En caso de empate, gana quien tenga más marcadores exactos."
      />

      <LeaderboardTable
        entries={entries}
        highlightNickname={session?.nickname}
      />
    </div>
  );
}
