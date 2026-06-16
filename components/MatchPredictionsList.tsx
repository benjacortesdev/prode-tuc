import type { MatchPredictionEntry } from "@/lib/types";
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

interface MatchPredictionsListProps {
  predictions: MatchPredictionEntry[];
  highlightNickname?: string;
  showPoints?: boolean;
}

function pointsLabel(points: number) {
  if (points === 3) return "Exacto · 3 pts";
  if (points === 1) return "Tendencia · 1 pt";
  return "0 pts";
}

function MatchPredictionsMobileList({
  predictions,
  highlightNickname,
  showPoints,
}: MatchPredictionsListProps) {
  return (
    <ul className="divide-y md:hidden">
      {predictions.map((entry) => {
        const isHighlighted = entry.nickname === highlightNickname;
        return (
          <li
            key={entry.nickname}
            className={cn(
              "flex items-center gap-3 px-4 py-4",
              isHighlighted && "bg-primary/10"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium">{entry.nickname}</p>
                {isHighlighted && (
                  <Badge variant="outline" className="shrink-0">
                    Tú
                  </Badge>
                )}
              </div>
              {showPoints && entry.points !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {pointsLabel(entry.points)}
                </p>
              )}
            </div>

            <p className="shrink-0 text-lg font-bold tabular-nums">
              {entry.homeScore} - {entry.awayScore}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default function MatchPredictionsList({
  predictions,
  highlightNickname,
  showPoints = false,
}: MatchPredictionsListProps) {
  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nadie pronosticó este partido.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b bg-primary px-4 py-4 text-primary-foreground">
        <CardTitle className="text-lg text-primary-foreground md:text-xl">
          Pronósticos
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          {predictions.length}{" "}
          {predictions.length === 1 ? "participante" : "participantes"}
        </CardDescription>
      </CardHeader>

      <MatchPredictionsMobileList
        predictions={predictions}
        highlightNickname={highlightNickname}
        showPoints={showPoints}
      />

      <CardContent className="hidden p-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Participante</TableHead>
              <TableHead className="text-right">Pronóstico</TableHead>
              {showPoints && (
                <TableHead className="text-right">Puntos</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.map((entry) => {
              const isHighlighted = entry.nickname === highlightNickname;
              return (
                <TableRow
                  key={entry.nickname}
                  className={isHighlighted ? "bg-primary/10" : undefined}
                >
                  <TableCell className="font-medium">
                    {entry.nickname}
                    {isHighlighted && (
                      <Badge variant="outline" className="ml-2">
                        Tú
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold tabular-nums">
                    {entry.homeScore} - {entry.awayScore}
                  </TableCell>
                  {showPoints && (
                    <TableCell className="text-right text-muted-foreground">
                      {entry.points !== undefined
                        ? pointsLabel(entry.points)
                        : "—"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
