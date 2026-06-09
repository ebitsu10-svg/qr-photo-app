import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@photosevents.com";
const APP_URL = process.env.AUTH_URL ?? "https://www.photosevents.com";

/**
 * Notify the event organizer that new photos were uploaded.
 * Called once per upload batch — not per individual photo.
 */
export async function sendNewPhotoNotification({
  to,
  eventName,
  eventSlug,
  newCount,
  totalCount,
}: {
  to: string;
  eventName: string;
  eventSlug: string;
  newCount: number;
  totalCount: number;
}) {
  const galleryUrl = `${APP_URL}/dashboard/events/${eventSlug}`;
  const plural = newCount !== 1;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `📸 ${newCount} new photo${plural ? "s" : ""} uploaded to "${eventName}"`,
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
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">📸 QR Photo Upload</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b">
              ${newCount} new photo${plural ? "s" : ""} uploaded!
            </h1>
            <p style="margin:0 0 24px;color:#52525b;font-size:15px">
              A guest just uploaded ${newCount} photo${plural ? "s" : ""} to your event
              <strong style="color:#09090b">${eventName}</strong>.
              You now have <strong style="color:#09090b">${totalCount}</strong> photo${totalCount !== 1 ? "s" : ""} in total.
            </p>
            <a href="${galleryUrl}"
               style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
              View gallery →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5">
            <p style="margin:0;color:#a1a1aa;font-size:12px">
              You're receiving this because you created the event "${eventName}" on
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
