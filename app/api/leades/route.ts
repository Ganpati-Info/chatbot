import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email = typeof body.email === "string" ? body.email.trim() : "";

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    const message = typeof body.message === "string" ? body.message.trim() : "";

    const websiteUrl =
      typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";

    const leadType =
      typeof body.leadType === "string" ? body.leadType : "general";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required.",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required.",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required.",
        },
        { status: 400 },
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const leadEmail = process.env.LEAD_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPassword || !leadEmail) {
      console.error("Missing SMTP environment variables");

      return NextResponse.json(
        {
          success: false,
          error: "Email service is not configured.",
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"Ganpati Website" <${smtpUser}>`,
      to: leadEmail,
      replyTo: email,

      subject:
        leadType === "website-improvement"
          ? `New Website Improvement Lead: ${name}`
          : leadType === "new-website"
            ? `New Website Project Lead: ${name}`
            : `New Chatbot Lead: ${name}`,

      text: `
New lead received from Ganpati Info Solutions chatbot.

Name: ${name}
Email: ${email}
Phone: ${phone}

Lead Type: ${leadType}

Website:
${websiteUrl || "Not provided"}

Message:
${message || "No message provided"}

Source:
Chatbot
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Chatbot Lead</h2>

          <p>
            A new lead has been submitted through the
            Ganpati Info Solutions website chatbot.
          </p>

          <hr />

          <p>
            <strong>Name:</strong> ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong> ${escapeHtml(email)}
          </p>

          <p>
            <strong>Phone:</strong> ${escapeHtml(phone)}
          </p>

          <p>
            <strong>Lead Type:</strong> ${escapeHtml(leadType)}
          </p>

          <p>
            <strong>Website:</strong>
            ${
              websiteUrl
                ? `<a href="${escapeHtml(websiteUrl)}">${escapeHtml(websiteUrl)}</a>`
                : "Not provided"
            }
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <p>
            ${escapeHtml(message || "No message provided").replace(/\n/g, "<br />")}
          </p>

          <hr />

          <p>
            <strong>Source:</strong> Website Chatbot
          </p>
        </div>
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Your request has been sent successfully.",
    });
  } catch (error) {
    console.error("Lead API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send your request right now.",
      },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
