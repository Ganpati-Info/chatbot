import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

interface LeadSummary {
  summary: string;
  projectType: string;
  requirements: string[];
  customerIntent: string;
}

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

    const leadSummary: LeadSummary = {
      summary:
        typeof body.leadSummary?.summary === "string"
          ? body.leadSummary.summary.trim()
          : "No summary available.",

      projectType:
        typeof body.leadSummary?.projectType === "string"
          ? body.leadSummary.projectType.trim()
          : "Not specified",

      requirements: Array.isArray(body.leadSummary?.requirements)
        ? body.leadSummary.requirements.filter(
            (item: unknown): item is string => typeof item === "string",
          )
        : [],

      customerIntent:
        typeof body.leadSummary?.customerIntent === "string"
          ? body.leadSummary.customerIntent.trim()
          : "Customer submitted a lead through the chatbot.",
    };

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

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const receiver = process.env.LEAD_EMAIL;

if (!host || !user || !pass || !receiver) {
  return NextResponse.json(
    {
      success: false,
      error: "Email service is not configured.",
    },
    { status: 500 },
  );
}

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const requirementsHtml =
      leadSummary.requirements.length > 0
        ? `
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            ${leadSummary.requirements
              .map(
                (requirement) => `
                  <li style="margin-bottom: 6px;">
                    ${escapeHtml(requirement)}
                  </li>
                `,
              )
              .join("")}
          </ul>
        `
        : `
          <p style="margin: 8px 0 0 0; color: #777;">
            No specific requirements were mentioned.
          </p>
        `;

    const emailHtml = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 760px;
          margin: 0 auto;
          color: #172033;
        "
      >

        <!-- Header -->

        <div
          style="
            background: #25499F;
            color: white;
            padding: 28px 24px;
            border-radius: 12px 12px 0 0;
          "
        >
          <h2 style="margin: 0 0 8px 0;">
            New Chatbot Lead
          </h2>

          <p style="margin: 0; opacity: 0.9;">
            Ganpati Info Solutions
          </p>
        </div>

        <div
          style="
            border: 1px solid #e5e7eb;
            border-top: 0;
            padding: 28px 24px;
            border-radius: 0 0 12px 12px;
          "
        >

          <!-- Lead Summary -->

          <h3 style="margin-top: 0;">
            Lead Summary
          </h3>

          <div
            style="
              background: #f7f8fa;
              border-radius: 10px;
              padding: 16px;
              line-height: 1.6;
              margin-bottom: 24px;
            "
          >
            ${escapeHtml(leadSummary.summary)}
          </div>

          <table
            style="
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 24px;
            "
          >

            <tr>
              <td
                style="
                  padding: 8px 0;
                  font-weight: bold;
                  width: 150px;
                  vertical-align: top;
                "
              >
                Project Type
              </td>

              <td style="padding: 8px 0;">
                ${escapeHtml(leadSummary.projectType)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 8px 0;
                  font-weight: bold;
                  vertical-align: top;
                "
              >
                Customer Intent
              </td>

              <td style="padding: 8px 0;">
                ${escapeHtml(leadSummary.customerIntent)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 8px 0;
                  font-weight: bold;
                  vertical-align: top;
                "
              >
                Requirements
              </td>

              <td style="padding: 8px 0;">
                ${requirementsHtml}
              </td>
            </tr>

          </table>

          <hr
            style="
              border: 0;
              border-top: 1px solid #e5e7eb;
              margin: 28px 0;
            "
          />

          <!-- Contact Details -->

          <h3>
            Contact Details
          </h3>

          <table
            style="
              border-collapse: collapse;
              width: 100%;
            "
          >

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Name
              </td>

              <td style="padding: 8px 0;">
                ${escapeHtml(name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Email
              </td>

              <td style="padding: 8px 0;">
                <a
                  href="mailto:${escapeHtml(email)}"
                  style="color: #25499F;"
                >
                  ${escapeHtml(email)}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Phone
              </td>

              <td style="padding: 8px 0;">
                ${escapeHtml(phone)}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Lead Type
              </td>

              <td style="padding: 8px 0;">
                ${escapeHtml(leadType)}
              </td>
            </tr>

            ${
              websiteUrl
                ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">
                      Website
                    </td>

                    <td style="padding: 8px 0;">
                      <a
                        href="${escapeHtml(websiteUrl)}"
                        style="color: #25499F;"
                      >
                        ${escapeHtml(websiteUrl)}
                      </a>
                    </td>
                  </tr>
                `
                : ""
            }

            ${
              message
                ? `
                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                        vertical-align: top;
                      "
                    >
                      Form Message
                    </td>

                    <td
                      style="
                        padding: 8px 0;
                        white-space: pre-wrap;
                      "
                    >
                      ${escapeHtml(message)}
                    </td>
                  </tr>
                `
                : ""
            }

          </table>

          <hr
            style="
              border: 0;
              border-top: 1px solid #e5e7eb;
              margin: 28px 0;
            "
          />

          <p
            style="
              font-size: 12px;
              color: #777;
              margin-bottom: 0;
            "
          >
            This lead was submitted through the Ganpati Info Solutions
            chatbot.
          </p>

        </div>
      </div>
    `;

    const emailText = `
NEW CHATBOT LEAD
================

LEAD SUMMARY
------------

Summary:
${leadSummary.summary}

Project Type:
${leadSummary.projectType}

Customer Intent:
${leadSummary.customerIntent}

Requirements:
${
  leadSummary.requirements.length
    ? leadSummary.requirements
        .map((requirement) => `- ${requirement}`)
        .join("\n")
    : "No specific requirements were mentioned."
}


CONTACT DETAILS
---------------

Name:
${name}

Email:
${email}

Phone:
${phone}

Lead Type:
${leadType}

Website:
${websiteUrl || "N/A"}

Form Message:
${message || "N/A"}
`;

    await transporter.sendMail({
      from: "Ganpati Chatbot",
      to: receiver,
      replyTo: email,

      subject: `New "${leadType}" lead from ${name}`,

      html: emailHtml,

      text: emailText,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Lead API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send your request.",
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
