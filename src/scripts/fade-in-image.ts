/**
 * Points an <img> at a new photo, fading it in when that's an improvement and
 * leaving it alone when it isn't.
 *
 * Two rules do all the work:
 *
 * 1. **Never hide pixels the reader can already see.** If the element is
 *    showing something, the swap happens in place — the browser keeps the old
 *    frame until the new one is decoded. Hiding it first would blink the photo
 *    to black, which is worse than the pop the fade exists to avoid.
 * 2. **Hide before the first paint, not after.** When the element is blank
 *    there is nothing to flash, so it can be hidden for free and revealed on
 *    load.
 *
 * The first rule is why this takes the URL instead of leaving the caller to
 * assign it: the decision depends on the state of the element *before* the src
 * changes, and by the time the caller has assigned it that state is gone.
 */

/**
 * Below this, revealing without a transition looks better than fading: 450ms of
 * fade on a photo that was already there just reads as lag.
 *
 * Measured, not guessed: these photos take 210–380ms from `src` to `load` on
 * localhost, and a warm cache barely moves that (211ms vs 273ms for the same
 * file) because the cost is decoding a 1–2 megapixel JPEG rather than the
 * transfer — so asking "was it cached" would not have answered anything.
 */
const GRACE_MS = 200;

export function swapImage(image: HTMLImageElement, url: string): void {
  // The rotation can land on the photo the server already rendered. Reassigning
  // the same src may not fire `load` at all, which would strand the reveal.
  if (image.getAttribute("src") === url) {
    return;
  }

  // Rule 1. `naturalWidth` is the honest test for "has pixels": it turns
  // non-zero as soon as the header arrives, so it also covers a progressive
  // JPEG that is still downloading but has already painted its first pass.
  if (image.naturalWidth > 0) {
    image.setAttribute("src", url);
    return;
  }

  // Rule 2.
  image.classList.add("oz-img-pending");
  const startedAt = performance.now();

  const reveal = () => {
    // A lazy image always fades: its clock starts when the src is assigned but
    // the browser doesn't fetch it until it nears the viewport, so the elapsed
    // time says nothing — and a photo arriving as you scroll to it has no
    // "already there" state to preserve anyway.
    if (image.loading === "lazy" || performance.now() - startedAt > GRACE_MS) {
      image.classList.add("oz-img-fade");
    }

    // Removing this in the same task as adding the transition is what starts
    // it: the transition is read from the style the change produces.
    image.classList.remove("oz-img-pending");
  };

  image.addEventListener("load", reveal, { once: true });
  // A broken image must not stay invisible: the alt text and layout still count.
  image.addEventListener("error", reveal, { once: true });

  image.setAttribute("src", url);
}
