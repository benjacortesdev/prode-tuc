import TeamWithFlag from "@/components/TeamWithFlag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-datetime";
import type { Match, Prediction } from "@/lib/types";

interface MatchResultCardProps {
  match: Match;
  prediction?: Prediction;
}

function pointsBadgeVariant(points: number) {
  if (points === 3) return "default";
  if (points === 1) return "secondary";
  return "outline";
}

export default function MatchResultCard({
  match,
  prediction,
}: MatchResultCardProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            {formatDateTime(match.startTime)}
          </span>
          {prediction?.points !== undefined ? (
            <Badge variant={pointsBadgeVariant(prediction.points)}>
              {prediction.points === 3
                ? "Exacto · 3 pts"
                : prediction.points === 1
                  ? "Tendencia · 1 pt"
                  : "0 pts"}
            </Badge>
          ) : (
            <Badge variant="outline">Sin pronóstico</Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <TeamWithFlag team={match.homeTeam} flagSize={24} />
            <p className="mt-1 text-center text-2xl font-bold text-primary">
              {match.homeScore}
            </p>
          </div>

          <span className="text-lg font-medium text-muted-foreground">-</span>

          <div className="flex-1">
            <TeamWithFlag team={match.awayTeam} flagSize={24} />
            <p className="mt-1 text-center text-2xl font-bold text-primary">
              {match.awayScore}
            </p>
          </div>
        </div>

        {prediction && (
          <p className="text-center text-sm text-muted-foreground">
            Tu pronóstico:{" "}
            <span className="font-medium text-foreground">
              {prediction.homeScore} - {prediction.awayScore}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
