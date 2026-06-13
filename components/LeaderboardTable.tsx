import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightNickname?: string;
}

export default function LeaderboardTable({
  entries,
  highlightNickname,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Aún no hay participantes en el torneo.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-emerald-800 text-white">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Participante</th>
            <th className="px-4 py-3 font-medium text-right">Puntos</th>
            <th className="px-4 py-3 font-medium text-right">Exactos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.nickname}
              className={`border-t border-gray-100 ${
                entry.nickname === highlightNickname
                  ? "bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 font-bold text-emerald-800">
                {entry.position}
              </td>
              <td className="px-4 py-3 font-medium">{entry.nickname}</td>
              <td className="px-4 py-3 text-right font-bold">
                {entry.totalPoints}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {entry.exactScores}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
