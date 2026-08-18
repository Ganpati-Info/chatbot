const COMPANY_URLS = [
  "https://www.ganpatiinfosolutions.com/",
  "https://www.ganpatiinfosolutions.com/about/",
  "https://www.ganpatiinfosolutions.com/services/",
  "https://www.ganpatiinfosolutions.com/portfolio/",
  "https://www.ganpatiinfosolutions.com/partnership/",
  "https://www.ganpatiinfosolutions.com/career/",
  "https://www.ganpatiinfosolutions.com/contact/",
];

interface CompanyPage {
  url: string;
  title: string;
  content: string;
}

let cachedKnowledge: string | null = null;
let cacheCreatedAt = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 6;

function cleanText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
}

async function fetchPage(url: string): Promise<CompanyPage | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Ganpati-Chatbot/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Company page failed: ${url}`, response.status);
      return null;
    }

    const html = await response.text();

    const content = cleanText(html);

    if (!content) {
      return null;
    }

    return {
      url,
      title: extractTitle(html),
      content,
    };
  } catch (error) {
    console.error(`Failed to fetch company page: ${url}`, error);
    return null;
  }
}

export async function getCompanyKnowledge() {
  const now = Date.now();

  if (cachedKnowledge && now - cacheCreatedAt < CACHE_DURATION) {
    return cachedKnowledge;
  }

  const pages = await Promise.all(COMPANY_URLS.map((url) => fetchPage(url)));

  const validPages = pages.filter((page): page is CompanyPage => page !== null);

  if (validPages.length === 0) {
    console.error("Unable to load Ganpati company website.");

    return "";
  }

  const knowledge = validPages
    .map(
      (page) => `
==================================================
PAGE: ${page.title || page.url}
URL: ${page.url}
==================================================

${page.content}
`,
    )
    .join("\n");

  cachedKnowledge = knowledge;
  cacheCreatedAt = now;

  return knowledge;
}
