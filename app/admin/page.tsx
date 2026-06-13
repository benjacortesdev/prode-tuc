import { getState } from "@/lib/db";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const state = await getState();
  const matches = [...state.matches].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return <AdminClient initialMatches={matches} />;
}
