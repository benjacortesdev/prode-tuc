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
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

  function navLinkClass(isActive: boolean, mobile = false) {
    return cn(
      buttonVariants({
        variant: isActive ? "secondary" : "ghost",
        size: mobile ? "lg" : "sm",
      }),
      mobile
        ? "h-12 w-full justify-start text-base"
        : undefined,
      isActive
        ? "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20"
        : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4">
        <Link
          href="/predictions"
          className="text-base font-bold tracking-tight hover:opacity-90 md:text-lg"
        >
          ⚽ Prode TUC
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(isActive)}
              >
                {link.label}
              </Link>
            );
          })}

          <Separator
            orientation="vertical"
            className="mx-1 h-5 bg-primary-foreground/25"
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

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 text-primary-foreground hover:bg-primary-foreground/10 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 5h16" />
              <path d="M4 12h16" />
              <path d="M4 19h16" />
            </svg>
          )}
        </Button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-primary-foreground/15 bg-primary px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(isActive, true)}
                >
                  {link.label}
                </Link>
              );
            })}

            <Separator className="my-2 bg-primary-foreground/20" />

            {user ? (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                className="h-12 w-full justify-start text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Salir
              </Button>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "h-12 w-full justify-start bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                )}
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
