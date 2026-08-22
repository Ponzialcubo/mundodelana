import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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

async function sign(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getEncodedSecret());
}

async function verify(token: string) {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret());
    return payload;
  } catch {
    return null;
  }
}

// ---------- Sesión de admin ----------

const ADMIN_COOKIE = "md_admin_session";

export async function createAdminSession(adminId: string) {
  const token = await sign({ sub: adminId, role: "admin" });
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verify(token);
  return payload?.role === "admin" ? (payload.sub as string) : null;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

// ---------- Sesión de clienta ----------

const CUSTOMER_COOKIE = "md_customer_session";

export async function createCustomerSession(customerId: string) {
  const token = await sign({ sub: customerId, role: "customer" });
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function getCustomerSession() {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verify(token);
  return payload?.role === "customer" ? (payload.sub as string) : null;
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
}
