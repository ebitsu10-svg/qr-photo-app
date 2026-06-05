import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";

/**
 * Notify the event organizer that a new photo was uploaded.
 * In production this should be batched/debounced to avoid spam.
 */
export async function sendNewPhotoNotification({
  to,
  eventName,
  eventSlug,
  photoCount,
}: {
  to: string;
  eventName: string;
  eventSlug: string;
  photoCount: number;
}) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/events/${eventSlug}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New photo uploaded to "${eventName}"`,
    html: `
      <p>Someone just uploaded a photo to your event <strong>${eventName}</strong>.</p>
      <p>Total photos so far: <strong>${photoCount}</strong></p>
      <p><a href="${dashboardUrl}">View your event gallery →</a></p>
    `,
  });
}
