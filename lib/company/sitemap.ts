const SITEMAP_URL = "https://www.ganpatiinfosolutions.com/sitemap.xml";

const ALLOWED_HOST = "www.ganpatiinfosolutions.com";

const PAGE_PATHS = {
  company: ["/", "/about/"],
  services: ["/services/"],
  portfolio: ["/portfolio/"],
  partnership: ["/partnership/"],
  careers: ["/career/"],
  contact: ["/contact/"],
  legal: ["/terms-conditions/", "/privacy-policy/"],
} as const;

type PageCategory = keyof typeof PAGE_PATHS;

export async function getSitemapUrls(): Promise<string[]> {
  try {
    const response = await fetch(SITEMAP_URL, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(`Sitemap request failed: ${response.status}`);
    }

    const xml = await response.text();

    const urls = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)]
      .map((match) => match[1].trim())
      .filter(Boolean)
      .filter((url) => {
        try {
          const parsed = new URL(url);

          return (
            parsed.hostname === ALLOWED_HOST ||
            parsed.hostname === "ganpatiinfosolutions.com"
          );
        } catch {
          return false;
        }
      });

    return urls;
  } catch (error) {
    console.error("Failed to read Ganpati sitemap:", error);

    return [];
  }
}

export async function getPagesForCategories(
  categories: PageCategory[],
): Promise<string[]> {
  const sitemapUrls = await getSitemapUrls();

  const requiredPaths = categories.flatMap((category) => PAGE_PATHS[category]);

  const selected = sitemapUrls.filter((url) => {
    try {
      const pathname = new URL(url).pathname;

      return requiredPaths.includes(pathname as never);
    } catch {
      return false;
    }
  });

  return selected;
}
