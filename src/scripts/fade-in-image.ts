/**
 * Fades a photo in *only if it is slow enough to be noticed*.
 *
 * The rotating photos get their src from JavaScript, so a slow one pops into
 * place. Hiding every image until it loads is worse though: one that comes
 * straight from cache would then blink for no reason.
 *
 * So the image is left alone for a grace period. If it hasn't arrived by then
 * — meaning there is nothing painted yet, so hiding it costs nothing and can't
 * flash — it's marked pending, and loading transitions it back to full opacity.
 * An image that beats the grace period is never touched at all.
 *
 * Call this *before* assigning the new src.
 */
/**
 * How long a photo may take before it's worth fading in.
 *
 * Measured rather than guessed: on localhost these photos take 210–380ms from
 * `src` to `load`, and a warm cache barely helps (211ms vs 273ms for the same
 * file) because the cost is decoding a 1–2 megapixel JPEG, not the transfer.
 * So "was it cached" is the wrong question — 200ms is simply the point where a
 * hard pop starts to read as a glitch instead of as the page drawing itself.
 */
const GRACE_MS = 200;

/**
 * A `loading="lazy"` image is fetched well before it scrolls into view, so by
 * the time it is this close the request is long since underway: if it still
 * hasn't finished, it really is slow. Starting the clock any earlier would put
 * a fade on cached photos, which is the thing we're trying to avoid.
 */
const LAZY_MARGIN = "200px";

function arm(image: HTMLImageElement): void {
  // Already decoded — a cache hit, or the browser simply got there first.
  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  const pending = window.setTimeout(() => {
    image.classList.add("oz-img-fade", "oz-img-pending");
  }, GRACE_MS);

  const settle = () => {
    window.clearTimeout(pending);
    image.classList.remove("oz-img-pending");
  };

  image.addEventListener("load", settle, { once: true });
  // A broken image must not stay invisible: the alt text and layout still count.
  image.addEventListener("error", settle, { once: true });
}

export function fadeInImage(image: HTMLImageElement): void {
  if (image.loading !== "lazy" || !("IntersectionObserver" in window)) {
    arm(image);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }
      observer.disconnect();
      arm(image);
    },
    { rootMargin: LAZY_MARGIN },
  );

  observer.observe(image);
}
