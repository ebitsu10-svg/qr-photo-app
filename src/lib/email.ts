import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@photosevents.com";
const APP_URL = process.env.AUTH_URL ?? "https://www.photosevents.com";

type Locale = "en" | "es";

const NOTIFICATION_COPY = {
  en: {
    brand: "QR Photo Upload",
    subject: (newCount: number, plural: boolean, eventName: string) =>
      `📸 ${newCount} new photo${plural ? "s" : ""} uploaded to "${eventName}"`,
    heading: (newCount: number, plural: boolean) =>
      `${newCount} new photo${plural ? "s" : ""} uploaded!`,
    body: (newCount: number, plural: boolean, eventName: string, totalCount: number) =>
      `A guest just uploaded ${newCount} photo${plural ? "s" : ""} to your event <strong style="color:#09090b">${eventName}</strong>. You now have <strong style="color:#09090b">${totalCount}</strong> photo${totalCount !== 1 ? "s" : ""} in total.`,
    cta: "View gallery →",
    footer: (eventName: string) =>
      `You're receiving this because you created the event "${eventName}" on`,
  },
  es: {
    brand: "Subida de Fotos QR",
    subject: (newCount: number, plural: boolean, eventName: string) =>
      `📸 ${newCount} foto${plural ? "s" : ""} nueva${plural ? "s" : ""} en "${eventName}"`,
    heading: (newCount: number, plural: boolean) =>
      `¡${newCount} foto${plural ? "s" : ""} nueva${plural ? "s" : ""} subida${plural ? "s" : ""}!`,
    body: (newCount: number, plural: boolean, eventName: string, totalCount: number) =>
      `Un invitado acaba de subir ${newCount} foto${plural ? "s" : ""} a tu evento <strong style="color:#09090b">${eventName}</strong>. Ahora tienes <strong style="color:#09090b">${totalCount}</strong> foto${totalCount !== 1 ? "s" : ""} en total.`,
    cta: "Ver galería →",
    footer: (eventName: string) =>
      `Recibes este correo porque creaste el evento "${eventName}" en`,
  },
} satisfies Record<Locale, {
  brand: string;
  subject: (newCount: number, plural: boolean, eventName: string) => string;
  heading: (newCount: number, plural: boolean) => string;
  body: (newCount: number, plural: boolean, eventName: string, totalCount: number) => string;
  cta: string;
  footer: (eventName: string) => string;
}>;

const SIGNIN_COPY: Record<Locale, {
  brand: string;
  subject: string;
  heading: string;
  body: string;
  cta: string;
  expiry: string;
  ignore: string;
}> = {
  en: {
    brand: "QR Photo Upload",
    subject: "Sign in to QR Photo Upload",
    heading: "Sign in",
    body: "Click the button below to sign in. This link will expire in 24 hours.",
    cta: "Sign in →",
    expiry: "This link expires in 24 hours.",
    ignore: "If you didn't request this email, you can safely ignore it.",
  },
  es: {
    brand: "Subida de Fotos QR",
    subject: "Inicia sesión en Subida de Fotos QR",
    heading: "Iniciar sesión",
    body: "Haz clic en el botón para iniciar sesión. Este enlace vencerá en 24 horas.",
    cta: "Iniciar sesión →",
    expiry: "Este enlace vence en 24 horas.",
    ignore: "Si no solicitaste este correo, puedes ignorarlo con seguridad.",
  },
};

/**
 * Send the next-auth magic-link sign-in email.
 * `url`'s embedded `callbackUrl` param (e.g. "/es/dashboard") determines the locale.
 */
export async function sendSignInEmail({
  to,
  url,
  locale = "en",
}: {
  to: string;
  url: string;
  locale?: Locale;
}) {
  const t = SIGNIN_COPY[locale];

  await resend.emails.send({
    from: FROM,
    to,
    subject: t.subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:24px 32px">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">📸 ${t.brand}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b">${t.heading}</h1>
            <p style="margin:0 0 24px;color:#52525b;font-size:15px">${t.body}</p>
            <a href="${url}"
               style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
              ${t.cta}
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5">
            <p style="margin:0;color:#a1a1aa;font-size:12px">${t.expiry} ${t.ignore}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

/**
 * Notify the event organizer that new photos were uploaded.
 * Called once per upload batch — not per individual photo.
 */
export async function sendNewPhotoNotification({
  to,
  locale = "en",
  eventName,
  eventSlug,
  newCount,
  totalCount,
}: {
  to: string;
  locale?: Locale;
  eventName: string;
  eventSlug: string;
  newCount: number;
  totalCount: number;
}) {
  const galleryUrl = `${APP_URL}/dashboard/events/${eventSlug}`;
  const plural = newCount !== 1;
  const t = NOTIFICATION_COPY[locale];

  await resend.emails.send({
    from: FROM,
    to,
    subject: t.subject(newCount, plural, eventName),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:24px 32px">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">📸 ${t.brand}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b">
              ${t.heading(newCount, plural)}
            </h1>
            <p style="margin:0 0 24px;color:#52525b;font-size:15px">
              ${t.body(newCount, plural, eventName, totalCount)}
            </p>
            <a href="${galleryUrl}"
               style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
              ${t.cta}
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5">
            <p style="margin:0;color:#a1a1aa;font-size:12px">
              ${t.footer(eventName)}
              <a href="${APP_URL}" style="color:#a1a1aa">${APP_URL.replace("https://","")}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
