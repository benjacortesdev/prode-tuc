import { getSession } from "@/lib/auth";
import { getState } from "@/lib/db";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <PageHeader title="Mi perfil" description="Tu resumen en el torneo" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{user.nickname}</CardTitle>
            {user.isAdmin && <Badge>Admin</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {user.totalPoints}
              </p>
              <p className="text-sm text-muted-foreground">Puntos totales</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-bold text-foreground">
                {user.exactScores}
              </p>
              <p className="text-sm text-muted-foreground">Marcadores exactos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
