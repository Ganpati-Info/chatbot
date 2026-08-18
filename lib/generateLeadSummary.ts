import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const leadSummarySchema = z.object({
  summary: z.string(),
  projectType: z.string(),
  requirements: z.array(z.string()),
  customerIntent: z.string(),
});

export async function generateLeadSummary(conversation: string) {
  if (!conversation.trim()) {
    return {
      summary: "No chatbot conversation was available.",
      projectType: "Not specified",
      requirements: [],
      customerIntent: "Customer submitted a lead through the chatbot.",
    };
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY is missing.");

    return {
      summary:
        "Lead submitted through the chatbot. Conversation summary unavailable.",
      projectType: "Not specified",
      requirements: [],
      customerIntent: "Customer submitted a lead through the chatbot.",
    };
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite"),
      schema: leadSummarySchema,

      system: `
You summarize chatbot conversations for the sales team of Ganpati Info Solutions.

Your job is to extract useful business information from the conversation.

Do not invent information.

Ignore greetings, casual conversation, jokes, repeated questions, and irrelevant discussion.

Pay attention to the customer's final and most relevant requirements.

If the customer changes their mind during the conversation, use their latest stated requirement.

Keep the summary concise and useful for a salesperson or developer who will follow up with the customer.

The summary should answer:
1. What does the customer want to build or improve?
2. What requirements did they mention?
3. What stage are they at?
4. Why are they contacting Ganpati?

For requirements, only include requirements explicitly mentioned or clearly established in the conversation.

Do not include sensitive information unless the customer explicitly provided it as part of the project discussion.
      `,

      prompt: `
Summarize this chatbot conversation:

${conversation}
      `,
    });

    return object;
  } catch (error) {
    console.error("Lead summary generation failed:", error);

    return {
      summary:
        "Lead submitted successfully, but an AI summary could not be generated.",
      projectType: "Not specified",
      requirements: [],
      customerIntent: "Customer submitted a lead through the Ganpati chatbot.",
    };
  }
}
