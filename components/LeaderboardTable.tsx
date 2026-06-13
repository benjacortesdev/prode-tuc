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
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Aún no hay participantes en el torneo.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b bg-primary text-primary-foreground">
        <CardTitle className="text-primary-foreground">Ranking</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Puntos totales y marcadores exactos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
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
