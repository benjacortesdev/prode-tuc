"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    <header className="border-b border-emerald-900/20 bg-emerald-800 text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/predictions" className="text-lg font-bold tracking-tight">
          Prode TUC
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-2 py-1 text-sm transition-colors sm:px-3 ${
                pathname === link.href
                  ? "bg-emerald-700 font-medium"
                  : "hover:bg-emerald-700/60"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-md px-2 py-1 text-sm hover:bg-emerald-700/60 sm:px-3"
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-2 py-1 text-sm hover:bg-emerald-700/60 sm:px-3"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
