import type { MatchGoal } from "@/lib/types";

interface MatchGoalsListProps {
  homeGoals?: MatchGoal[];
  awayGoals?: MatchGoal[];
}

function GoalColumn({
  goals,
  align,
}: {
  goals: MatchGoal[];
  align: "left" | "right";
}) {
  if (goals.length === 0) {
    return <div />;
  }

  return (
    <ul
      className={`space-y-1 text-xs text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {goals.map((goal, index) => (
        <li key={`${goal.minute}-${goal.player}-${index}`}>
          <span className="font-medium text-foreground">{goal.player}</span>{" "}
          {goal.minute}&apos;
        </li>
      ))}
    </ul>
  );
}

export default function MatchGoalsList({
  homeGoals = [],
  awayGoals = [],
}: MatchGoalsListProps) {
  if (homeGoals.length === 0 && awayGoals.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 border-t pt-3">
      <GoalColumn goals={homeGoals} align="right" />
      <GoalColumn goals={awayGoals} align="left" />
    </div>
  );
}
