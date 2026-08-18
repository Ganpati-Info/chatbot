const MAX_CONTENT_LENGTH = 18000;

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchWebsitePage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: 3600,
      },
      headers: {
        "User-Agent": "GanpatiInfoSolutions-Chatbot/1.0",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch company page ${url}: ${response.status}`);

      return "";
    }

    const html = await response.text();

    const text = cleanHtml(html);

    return text.slice(0, MAX_CONTENT_LENGTH);
  } catch (error) {
    console.error(`Error fetching company page ${url}:`, error);

    return "";
  }
}
