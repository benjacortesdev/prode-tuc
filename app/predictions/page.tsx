import { getState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import PredictionsClient from "./PredictionsClient";

export default async function PredictionsPage() {
  const session = await getSession();
  const state = await getState();

  const matches = [...state.matches].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const predictions = session
    ? state.predictions.filter((p) => p.userId === session.userId)
    : [];

  return (
    <PredictionsClient
      initialMatches={matches}
      initialPredictions={predictions}
      isLoggedIn={Boolean(session)}
    />
  );
}
