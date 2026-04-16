import type { Locale } from "../i18n/translations";

const baseRawUrl =
  "https://raw.githubusercontent.com/outzero-app/outzero-legal-docs/main";

function localeFolder(locale: Locale): "en" | "es" {
  return locale === "es" ? "es" : "en";
}

export async function fetchLegalMarkdown(
  locale: Locale,
  fileName: string,
): Promise<string> {
  const response = await fetch(
    `${baseRawUrl}/${localeFolder(locale)}/${fileName}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch legal document ${fileName}: ${response.status}`,
    );
  }

  const markdown = (await response.text()).replace(/\r\n/g, "\n").trim();

  if (!markdown) {
    throw new Error(`Legal document ${fileName} is empty`);
  }

  return markdown;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderSimpleMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const paragraph = paragraphLines.join(" ").trim();
    if (paragraph) {
      htmlParts.push(`<p>${escapeHtml(paragraph)}</p>`);
    }

    paragraphLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      htmlParts.push(`<h2>${escapeHtml(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      htmlParts.push(`<h1>${escapeHtml(line.slice(2).trim())}</h1>`);
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();

  return htmlParts.join("\n");
}
