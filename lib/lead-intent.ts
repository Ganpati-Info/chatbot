import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const leadIntentSchema = z.object({
  shouldShowLeadForm: z.boolean(),
  reason: z.string(),
});

export async function detectLeadIntent(conversation: string) {
  if (!conversation.trim()) {
    return {
      shouldShowLeadForm: false,
      reason: "",
    };
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return {
      shouldShowLeadForm: false,
      reason: "",
    };
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: leadIntentSchema,

      system: `
You decide whether a visitor should be shown the Ganpati Info Solutions contact form.

Return shouldShowLeadForm=true when the visitor:

- explicitly wants to contact the team
- asks to connect with the team
- asks to speak with someone
- asks for a consultation
- asks for a quote that requires team discussion
- wants to start a project
- agrees to speak with the team
- asks how to get in touch
- provides a phone number or email address
- has reached a clear sales handoff point after discussing a project

Return shouldShowLeadForm=false when:

- the visitor is still asking normal informational questions
- the visitor is still exploring services
- the visitor is still describing their project
- more useful discovery questions should be asked first
- the visitor has not indicated interest in contacting the team

IMPORTANT:

Do not ask the visitor for their phone number or email address.

The frontend contact form collects those details.

If the visitor says "yes" after the assistant asks whether they want to speak with the team, return true.

Use the entire conversation to understand context.

Do not trigger the form simply because the conversation mentions words such as "team", "contact", "website", or "price".

Only trigger when a genuine contact or sales handoff is appropriate.
      `,

      prompt: `
Conversation:

${conversation}
      `,
    });

    return object;
  } catch (error) {
    console.error("Lead intent detection failed:", error);

    return {
      shouldShowLeadForm: false,
      reason: "",
    };
  }
}
