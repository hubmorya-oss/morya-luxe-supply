/**
 * Slack Notification Service for Morya Luxe Supply
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

export async function sendSlackInquiryNotification(lead: {
  salonName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  requirementType: string;
  estimatedBudget: string;
  message?: string;
}) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL is not configured.");
    return false;
  }

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello%20${encodeURIComponent(
    lead.contactPerson
  )},%20this%20is%20Morya%20Luxe%20Supply%20regarding%20your%20salon%20inquiry%20for%20${encodeURIComponent(
    lead.salonName
  )}.`;

  const formattedType = lead.requirementType.replace(/_/g, " ").toUpperCase();

  const payload = {
    text: `💈 *New Salon B2B Lead:* ${lead.salonName} (${lead.city}) - ${lead.estimatedBudget}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "💈 New Salon Wholesale Inquiry | Morya Luxe Supply",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Salon Name:*\n${lead.salonName}`,
          },
          {
            type: "mrkdwn",
            text: `*Contact Person:*\n${lead.contactPerson}`,
          },
          {
            type: "mrkdwn",
            text: `*Mobile:*\n<tel:${lead.phone}|${lead.phone}>`,
          },
          {
            type: "mrkdwn",
            text: `*Location:*\n${lead.city}, ${lead.state}`,
          },
          {
            type: "mrkdwn",
            text: `*Requirement Type:*\n${formattedType}`,
          },
          {
            type: "mrkdwn",
            text: `*Estimated Budget:*\n${lead.estimatedBudget}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Equipment & Requirements:*\n>${lead.message || "No specific notes provided."}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "💬 Reply via WhatsApp",
              emoji: true,
            },
            url: waUrl,
            style: "primary",
          }
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST | Morya Luxe Supply B2B Portal`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to send Slack webhook:", errText);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Slack webhook notification error:", error);
    return false;
  }
}
