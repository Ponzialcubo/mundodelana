import { Resend } from "resend";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

let cachedClient: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY es obligatoria para enviar correos. Defínela en .env.");
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <no-responder@mundolana.es>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const client = getClient();
  await client.emails.send({
    from: getFromAddress(),
    to,
    subject: "Restablece tu contraseña de Mundolana",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #4A3F3B;">
        <h1 style="font-size: 20px; font-weight: 500;">Restablece tu contraseña</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          Has pedido cambiar la contraseña de tu cuenta en ${SITE_URL}. Si no has sido tú, puedes ignorar este correo:
          tu contraseña actual sigue funcionando igual.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #E8B4B8; color: #4A3F3B; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Elegir nueva contraseña
          </a>
        </p>
        <p style="font-size: 12.5px; color: #8A7A72;">
          Este enlace caduca en 1 hora y solo se puede usar una vez. Si no funciona, copia y pega esta dirección en el navegador:<br>
          ${resetUrl}
        </p>
      </div>
    `,
  });
}
