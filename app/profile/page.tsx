import { getSession } from "@/lib/auth";
import { getState } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const state = await getState();
  const user = state.users.find((u) => u.id === session.userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi perfil</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Apodo</p>
          <p className="text-lg font-semibold">{user.nickname}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>

        {user.isAdmin && (
          <div className="mb-4">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              Administrador
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-700">
              {user.totalPoints}
            </p>
            <p className="text-sm text-gray-500">Puntos totales</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-700">
              {user.exactScores}
            </p>
            <p className="text-sm text-gray-500">Marcadores exactos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
