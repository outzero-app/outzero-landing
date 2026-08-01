/**
 * Swaps an editorial backdrop for another photo of the same spot pool on every
 * page load, so the landing looks different between visits without the site
 * having to talk to Firebase at runtime.
 *
 * The pool is embedded in the page at build time as a JSON script block; this
 * only draws from it and rewrites the photo and its credit.
 */
import { swapImage } from "./fade-in-image";

interface RotationPhoto {
  id: string;
  name: string;
  url: string;
  author?: string;
}

export function rotatePhoto(rootSelector: string, poolSelector: string, photoSelector: string): void {
  const root = document.querySelector<HTMLElement>(rootSelector);
  const poolNode = document.querySelector<HTMLScriptElement>(poolSelector);

  if (!root || !poolNode?.textContent) {
    return;
  }

  let pool: RotationPhoto[] = [];
  try {
    pool = JSON.parse(poolNode.textContent) as RotationPhoto[];
  } catch {
    return;
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (!picked) {
    return;
  }

  const image = root.querySelector<HTMLImageElement>(photoSelector);
  if (image) {
    swapImage(image, picked.url);
  }

  const credit = root.querySelector<HTMLAnchorElement>(".photo-credit");
  if (!credit) {
    return;
  }

  credit.href = `https://web.outzero.app/spot/${picked.id}`;

  const name = credit.querySelector<HTMLElement>(".photo-credit-name");
  if (name) {
    name.textContent = picked.name;
  }

  // The span is always in the markup rather than created here: an element built
  // with createElement would miss Astro's scoping attribute and lose its styles.
  const author = credit.querySelector<HTMLElement>(".photo-credit-author");
  if (author) {
    author.textContent = picked.author ?? "";
    author.hidden = !picked.author;
  }
}
