"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavUser {
  nickname: string;
  isAdmin: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser({
            nickname: data.user.nickname,
            isAdmin: data.user.isAdmin,
          });
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }

  const links = [
    { href: "/predictions", label: "Pronósticos" },
    { href: "/leaderboard", label: "Ranking" },
  ];

  if (user) {
    links.push({ href: "/profile", label: "Perfil" });
    if (user.isAdmin) {
      links.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/predictions"
          className="text-lg font-bold tracking-tight hover:opacity-90"
        >
          ⚽ Prode TUC
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20"
                    : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <Separator
            orientation="vertical"
            className="mx-1 hidden h-5 bg-primary-foreground/25 sm:block"
          />

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Salir
            </Button>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              )}
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
