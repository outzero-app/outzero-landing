import type { Locale } from "../i18n/translations";

const baseRawUrl =
  "https://raw.githubusercontent.com/outzero-app/outzero-legal-docs/main";
const githubCommitsApiUrl =
  "https://api.github.com/repos/outzero-app/outzero-legal-docs/commits";

export interface LegalDocumentData {
  markdown: string;
  lastUpdatedAt: Date | null;
}

function localeFolder(locale: Locale): "en" | "es" {
  return locale === "es" ? "es" : "en";
}

export async function fetchLegalMarkdown(
  locale: Locale,
  fileName: string,
): Promise<LegalDocumentData> {
  const folder = localeFolder(locale);
  const markdownResponse = await fetch(`${baseRawUrl}/${folder}/${fileName}`, {
    cache: "no-store",
  });

  if (!markdownResponse.ok) {
    throw new Error(
      `Failed to fetch legal document ${fileName}: ${markdownResponse.status}`,
    );
  }

  const markdown = (await markdownResponse.text())
    .replace(/\r\n/g, "\n")
    .trim();

  if (!markdown) {
    throw new Error(`Legal document ${fileName} is empty`);
  }

  const rawLastModified = markdownResponse.headers.get("last-modified");
  const fallbackLastUpdatedAt = rawLastModified
    ? parseDateSafely(rawLastModified)
    : null;

  let lastUpdatedAt = fallbackLastUpdatedAt;

  try {
    const commitMetadata = await fetchLatestCommitMetadata(folder, fileName);
    lastUpdatedAt = commitMetadata.lastUpdatedAt ?? fallbackLastUpdatedAt;
  } catch {
    lastUpdatedAt = fallbackLastUpdatedAt;
  }

  return {
    markdown,
    lastUpdatedAt,
  };
}

async function fetchLatestCommitMetadata(
  folder: "en" | "es",
  fileName: string,
): Promise<{ lastUpdatedAt: Date | null }> {
  const commitUrl = new URL(githubCommitsApiUrl);
  commitUrl.searchParams.set("path", `${folder}/${fileName}`);
  commitUrl.searchParams.set("page", "1");
  commitUrl.searchParams.set("per_page", "1");

  const response = await fetch(commitUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch legal commit metadata for ${fileName}: ${response.status}`,
    );
  }

  const commits = (await response.json()) as Array<{
    commit?: {
      committer?: {
        date?: string;
      };
    };
  }>;

  const rawDate = commits[0]?.commit?.committer?.date;

  if (!rawDate) {
    return { lastUpdatedAt: null };
  }

  return {
    lastUpdatedAt: parseDateSafely(rawDate),
  };
}

function parseDateSafely(value: string): Date | null {
  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Renders the subset of Markdown the legal documents actually use: ATX
 * headings up to `######`, unordered and ordered lists, and paragraphs.
 */
export function renderSimpleMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listTag: "ul" | "ol" | null = null;

  const flushParagraph = () => {
    const paragraph = paragraphLines.join(" ").trim();
    paragraphLines = [];

    if (paragraph) {
      htmlParts.push(`<p>${escapeHtml(paragraph)}</p>`);
    }
  };

  const flushList = () => {
    if (listItems.length > 0 && listTag) {
      const items = listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      htmlParts.push(`<${listTag}>${items}</${listTag}>`);
    }

    listItems = [];
    listTag = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      htmlParts.push(`<h${level}>${escapeHtml(heading[2].trim())}</h${level}>`);
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (listTag !== "ul") {
        flushList();
        listTag = "ul";
      }
      listItems.push(bullet[1].trim());
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      if (listTag !== "ol") {
        flushList();
        listTag = "ol";
      }
      listItems.push(numbered[1].trim());
      continue;
    }

    // A plain line right after a bullet is a continuation of that item.
    if (listTag && listItems.length > 0) {
      listItems[listItems.length - 1] += ` ${line}`;
      continue;
    }

    paragraphLines.push(line);
  }

  flushAll();

  return htmlParts.join("\n");
}
