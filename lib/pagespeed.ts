type PageSpeedAudit = {
  id: string;
  title: string;
  description?: string;
  score: number | null;
  displayValue?: string;
  explanation?: string;
};

type PageSpeedResult = {
  strategy: "mobile" | "desktop";
  url: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  metrics: {
    lcp?: string;
    cls?: string;
    fcp?: string;
    inp?: string;
    tbt?: string;
    speedIndex?: string;
  };
  issues: PageSpeedAudit[];
};

const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function score(value: number | null | undefined) {
  if (typeof value !== "number") {
    return null;
  }

  return Math.round(value * 100);
}

function getAudit(audits: Record<string, any>, id: string) {
  const audit = audits[id];

  if (!audit) {
    return undefined;
  }

  return {
    id,
    title: audit.title,
    description: audit.description,
    score: typeof audit.score === "number" ? audit.score : null,
    displayValue: audit.displayValue,
    explanation: audit.explanation,
  };
}

function getIssues(audits: Record<string, any>) {
  return Object.values(audits)
    .filter((audit: any) => {
      return (
        typeof audit.score === "number" &&
        audit.score < 0.9 &&
        audit.scoreDisplayMode !== "notApplicable" &&
        audit.scoreDisplayMode !== "manual"
      );
    })
    .map((audit: any) => ({
      id: audit.id,
      title: audit.title,
      description: audit.description,
      score: audit.score,
      displayValue: audit.displayValue,
      explanation: audit.explanation,
    }))
    .slice(0, 15);
}

async function runPageSpeed(
  url: string,
  strategy: "mobile" | "desktop",
): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is not configured.");
  }

  const requestUrl = new URL(API_URL);

  requestUrl.searchParams.set("url", url);
  requestUrl.searchParams.set("key", apiKey);
  requestUrl.searchParams.set("strategy", strategy);

  requestUrl.searchParams.append("category", "performance");

  requestUrl.searchParams.append("category", "seo");

  requestUrl.searchParams.append("category", "accessibility");

  requestUrl.searchParams.append("category", "best-practices");

  const response = await fetch(requestUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `PageSpeed request failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();

  const lighthouse = data.lighthouseResult;

  const categories = lighthouse?.categories ?? {};

  const audits = lighthouse?.audits ?? {};

  return {
    strategy,
    url: lighthouse?.finalUrl ?? url,

    scores: {
      performance: score(categories.performance?.score),
      seo: score(categories.seo?.score),
      accessibility: score(categories.accessibility?.score),
      bestPractices: score(categories["best-practices"]?.score),
    },

    metrics: {
      lcp: getAudit(audits, "largest-contentful-paint")?.displayValue,

      cls: getAudit(audits, "cumulative-layout-shift")?.displayValue,

      fcp: getAudit(audits, "first-contentful-paint")?.displayValue,

      inp: getAudit(audits, "interaction-to-next-paint")?.displayValue,

      tbt: getAudit(audits, "total-blocking-time")?.displayValue,

      speedIndex: getAudit(audits, "speed-index")?.displayValue,
    },

    issues: getIssues(audits),
  };
}

export async function analyzeWebsite(url: string) {
  const [mobile, desktop] = await Promise.all([
    runPageSpeed(url, "mobile"),
    runPageSpeed(url, "desktop"),
  ]);

  return {
    mobile,
    desktop,
  };
}
