import type { LeaderboardEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightNickname?: string;
}

function LeaderboardMobileList({
  entries,
  highlightNickname,
}: LeaderboardTableProps) {
  return (
    <ul className="divide-y md:hidden">
      {entries.map((entry) => {
        const isHighlighted = entry.nickname === highlightNickname;
        return (
          <li
            key={entry.nickname}
            className={cn(
              "flex items-center gap-3 px-4 py-4",
              isHighlighted && "bg-primary/10"
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center">
              {entry.position === 1 ? (
                <Badge className="size-8 justify-center text-sm">1</Badge>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {entry.position}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium">{entry.nickname}</p>
                {isHighlighted && (
                  <Badge variant="outline" className="shrink-0">
                    Tú
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {entry.exactScores} exactos
              </p>
            </div>

            <p className="shrink-0 text-2xl font-bold tabular-nums">
              {entry.totalPoints}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default function LeaderboardTable({
  entries,
  highlightNickname,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Aún no hay participantes en el torneo.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b bg-primary px-4 py-4 text-primary-foreground">
        <CardTitle className="text-lg text-primary-foreground md:text-xl">
          Ranking
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Puntos totales y marcadores exactos
        </CardDescription>
      </CardHeader>

      <LeaderboardMobileList
        entries={entries}
        highlightNickname={highlightNickname}
      />

      <CardContent className="hidden p-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Participante</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
              <TableHead className="text-right">Exactos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isHighlighted = entry.nickname === highlightNickname;
              return (
                <TableRow
                  key={entry.nickname}
                  className={isHighlighted ? "bg-primary/10" : undefined}
                >
                  <TableCell className="font-bold text-primary">
                    {entry.position === 1 ? (
                      <Badge variant="default">1</Badge>
                    ) : (
                      entry.position
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.nickname}
                    {isHighlighted && (
                      <Badge variant="outline" className="ml-2">
                        Tú
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold">
                    {entry.totalPoints}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {entry.exactScores}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
