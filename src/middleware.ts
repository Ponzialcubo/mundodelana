import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET es obligatoria en producción. Defínela en .env.");
    }
    return "dev-secret-solo-para-desarrollo-local";
  }
  return value;
}

let cachedSecret: Uint8Array | null = null;
function getEncodedSecret() {
  if (!cachedSecret) cachedSecret = new TextEncoder().encode(getSecret());
  return cachedSecret;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("md_admin_session")?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getEncodedSecret());
      if (payload.role === "admin") return NextResponse.next();
    } catch {
      // token inválido, cae al redirect
    }
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
