import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getState } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildMatchPredictions, isMatchLocked } from "@/lib/scoring";
import MatchDetailClient from "./MatchDetailClient";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const [state, session] = await Promise.all([getState(), getSession()]);

  const match = state.matches.find((m) => m.id === id);
  if (!match) {
    notFound();
  }

  const isLocked = isMatchLocked(match);
  const userPrediction = session
    ? state.predictions.find(
        (p) => p.userId === session.userId && p.matchId === id
      )
    : undefined;

  const publishedPredictions =
    session && isLocked ? buildMatchPredictions(state, id) : null;

  return (
    <div>
      <PageHeader
        title={`${match.homeTeam} vs ${match.awayTeam}`}
        description="Detalle del partido y pronósticos del grupo."
      />

      <MatchDetailClient
        initialMatch={match}
        userPrediction={userPrediction}
        publishedPredictions={publishedPredictions}
        isLoggedIn={Boolean(session)}
        isLocked={isLocked}
        highlightNickname={session?.nickname}
      />
    </div>
  );
}
