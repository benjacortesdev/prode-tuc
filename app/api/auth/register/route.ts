import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getState, setState } from "@/lib/db";
import { createToken, getCookieName, getCookieOptions } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  nickname: z
    .string()
    .min(2, "El apodo debe tener al menos 2 caracteres")
    .max(30),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { email, nickname, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const state = await getState();

    if (state.users.some((u) => u.email === normalizedEmail)) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 409 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const isAdmin = adminEmail
      ? normalizedEmail === adminEmail
      : state.users.length === 0;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      nickname: nickname.trim(),
      passwordHash,
      isAdmin,
      totalPoints: 0,
      exactScores: 0,
      createdAt: new Date().toISOString(),
    };

    state.users.push(user);
    await setState(state);

    const token = await createToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
      },
    });

    response.cookies.set(getCookieName(), token, getCookieOptions());
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
