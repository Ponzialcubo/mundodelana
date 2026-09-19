import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/seo";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const { email } = await req.json();

  // Always return the same generic response whether or not the account
  // exists, a Google-only account with no password, etc. — the response
  // itself must never reveal which emails are registered.
  const genericResponse = NextResponse.json({
    ok: true,
    message: "Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña.",
  });

  if (!email || typeof email !== "string") return genericResponse;

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return genericResponse;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      customerId: customer.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${SITE_URL}/acceso/restablecer?token=${token}`;

  try {
    await sendPasswordResetEmail(customer.email, resetUrl);
  } catch (err) {
    console.error("No se ha podido enviar el correo de restablecimiento:", err);
    // Still return the generic response: don't leak delivery failures either.
  }

  return genericResponse;
}
