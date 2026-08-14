export const maxDuration = 60;

type Strategy = "mobile" | "desktop";

type Audit = {
  id: string;
  title: string;
  description?: string;
  score: number | null;
  displayValue?: string | null;
  numericValue?: number;
  numericUnit?: string;
};

type Finding = {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue: string | null;
  priority: "high" | "medium";
};

function normalizeUrl(value: string) {
  let url = value.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

async function getPageSpeedData(url: string, strategy: Strategy) {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is missing");
  }

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );

  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("strategy", strategy);

  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.append("category", "accessibility");
  endpoint.searchParams.append("category", "best-practices");
  endpoint.searchParams.append("category", "seo");

  const response = await fetch(endpoint.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("PageSpeed error:", errorText);

    throw new Error("PageSpeed request failed");
  }

  return response.json();
}

function getScore(categories: Record<string, any> | undefined, name: string) {
  const score = categories?.[name]?.score;

  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score * 100);
}

/*
 * These audits usually produce useful information
 * for a business-facing website review.
 */
const IMPORTANT_AUDITS = new Set([
  // Performance
  "largest-contentful-paint",
  "first-contentful-paint",
  "speed-index",
  "total-blocking-time",
  "cumulative-layout-shift",
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "uses-optimized-images",
  "uses-responsive-images",
  "modern-image-formats",
  "efficient-animated-content",
  "uses-text-compression",

  // SEO
  "meta-description",
  "document-title",
  "robots-txt",
  "canonical",
  "hreflang",
  "link-text",
  "crawlable-anchors",
  "is-crawlable",

  // Accessibility
  "color-contrast",
  "image-alt",
  "button-name",
  "link-name",
  "label",
  "heading-order",
  "html-has-lang",

  // Best practices
  "viewport",
  "uses-https",
  "no-vulnerable-libraries",
  "geolocation-on-start",
  "doctype",
]);

/*
 * Audits that are useful internally but usually
 * do not help a business owner understand the
 * website problem.
 */
const IGNORED_AUDITS = new Set([
  "diagnostics",
  "network-requests",
  "network-rtt",
  "network-server-latency",
  "mainthread-work-breakdown",
  "bootup-time",
  "critical-request-chains",
  "font-display",
  "third-parties",
  "dom-size",
  "legacy-javascript",
  "uses-long-cache-ttl",
  "total-byte-weight",
  "unused-preload",
  "preload-lcp-image",
  "uses-rel-preconnect",
  "uses-rel-preload",
  "no-unload-listeners",
]);

function getPriority(score: number) {
  if (score < 50) {
    return "high" as const;
  }

  return "medium" as const;
}

function getRelevantAudits(lighthouseResult: any): Finding[] {
  const audits = lighthouseResult?.audits;

  if (!audits) {
    return [];
  }

  const findings: Finding[] = [];

  for (const [id, rawAudit] of Object.entries(audits)) {
    const audit = rawAudit as Audit;

    if (!audit) {
      continue;
    }

    if (!IMPORTANT_AUDITS.has(id)) {
      continue;
    }

    if (IGNORED_AUDITS.has(id)) {
      continue;
    }

    if (audit.score === null || typeof audit.score !== "number") {
      continue;
    }

    /*
     * 90+ is considered healthy enough for our
     * business-facing analysis.
     */
    if (audit.score >= 0.9) {
      continue;
    }

    const score = Math.round(audit.score * 100);

    findings.push({
      id,
      title: audit.title,
      description: audit.description ?? "",
      score,
      displayValue: audit.displayValue ?? null,
      priority: getPriority(score),
    });
  }

  /*
   * Most serious findings first.
   */
  findings.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === "high" ? -1 : 1;
    }

    return a.score - b.score;
  });

  /*
   * Keep the dataset small.
   * Gemini does not need 20 Lighthouse findings.
   */
  return findings.slice(0, 6);
}

function getCategoryStatus(score: number | null) {
  if (score === null) {
    return "unknown";
  }

  if (score >= 90) {
    return "good";
  }

  if (score >= 70) {
    return "needs-attention";
  }

  return "needs-improvement";
}

function buildCategorySummary(categories: Record<string, any> | undefined) {
  const performance = getScore(categories, "performance");

  const accessibility = getScore(categories, "accessibility");

  const bestPractices = getScore(categories, "best-practices");

  const seo = getScore(categories, "seo");

  return {
    performance: {
      score: performance,
      status: getCategoryStatus(performance),
    },

    accessibility: {
      score: accessibility,
      status: getCategoryStatus(accessibility),
    },

    bestPractices: {
      score: bestPractices,
      status: getCategoryStatus(bestPractices),
    },

    seo: {
      score: seo,
      status: getCategoryStatus(seo),
    },
  };
}

function buildStrategySummary(result: any) {
  const lighthouseResult = result?.lighthouseResult;

  if (!lighthouseResult) {
    return {
      categories: null,
      findings: [],
    };
  }

  return {
    categories: buildCategorySummary(lighthouseResult.categories),

    findings: getRelevantAudits(lighthouseResult),
  };
}

function buildSummary(mobile: any, desktop: any) {
  return {
    mobile: buildStrategySummary(mobile),
    desktop: buildStrategySummary(desktop),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawUrl = body.url;

    if (typeof rawUrl !== "string") {
      return Response.json(
        {
          success: false,
          error: "Website URL is required.",
        },
        {
          status: 400,
        },
      );
    }

    const url = normalizeUrl(rawUrl);

    if (!url) {
      return Response.json(
        {
          success: false,
          error: "Please provide a valid website URL.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Run mobile and desktop checks together.
     */
    const [mobile, desktop] = await Promise.all([
      getPageSpeedData(url, "mobile"),
      getPageSpeedData(url, "desktop"),
    ]);

    const summary = buildSummary(mobile, desktop);

    return Response.json({
      success: true,

      website: url,

      analysis: summary,
    });
  } catch (error) {
    console.error("Website check error:", error);

    return Response.json(
      {
        success: false,
        error: "We couldn't complete the website check right now.",
      },
      {
        status: 500,
      },
    );
  }
}
