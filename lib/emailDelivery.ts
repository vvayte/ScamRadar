type EmailDeliveryResult = {
  delivered: boolean;
  provider: "resend" | "none";
  error?: string;
};

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export function getConfiguredSenderEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "ScamRadar <noreply@scamradar.app>";
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFrom) {
    return { delivered: false, provider: "none" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (response.ok) return { delivered: true, provider: "resend" };

    const error = await response.text();
    return {
      delivered: false,
      provider: "resend",
      error: error.slice(0, 400),
    };
  } catch (error) {
    return {
      delivered: false,
      provider: "resend",
      error: String(error),
    };
  }
}
