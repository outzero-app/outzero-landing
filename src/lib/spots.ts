import type { Locale, Translations } from "../i18n/translations";

const FUNCTIONS_BASE = "https://europe-west1-outzero.cloudfunctions.net";

/* -------------------------------------------------------------------------
 * Build seed
 *
 * Which spots get featured is drawn at random on every build, so the daily
 * rebuild refreshes the page even when the underlying data has not changed —
 * and so running the build twice locally shows two different line-ups.
 *
 * Set OUTZERO_SPOT_SEED to reproduce a specific build (the seed used is
 * printed at the start of every build).
 * ---------------------------------------------------------------------- */

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const EXPLICIT_SEED = process.env.OUTZERO_SPOT_SEED;

const BUILD_SEED: string =
  EXPLICIT_SEED ?? String(Date.now() ^ Math.floor(Math.random() * 0xffffffff));

/**
 * With no seed pinned, `astro dev` re-draws on every page load so you can just
 * keep hitting refresh to preview different line-ups. A build always draws once
 * and sticks to it, so the two locales stay in sync.
 */
const REDRAW_EVERY_RENDER = EXPLICIT_SEED == null && import.meta.env.DEV;

console.info(
  REDRAW_EVERY_RENDER
    ? "[spots] dev mode: re-drawing spots on every page load — set OUTZERO_SPOT_SEED to pin a selection"
    : `[spots] build seed ${BUILD_SEED} — re-run with OUTZERO_SPOT_SEED=${BUILD_SEED} to reproduce this selection`,
);

/**
 * A fresh generator per purpose, derived from the build seed. Keying by
 * purpose (rather than sharing one advancing stream) keeps the draw stable
 * across pages, so `/` and `/es/` feature the same spots.
 */
function rngFor(purpose: string): () => number {
  // mulberry32
  let state = hashString(
    REDRAW_EVERY_RENDER ? `${Math.random()}:${purpose}` : `${BUILD_SEED}:${purpose}`,
  );
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Orders items randomly but biased towards higher scores
 * (Efraimidis–Spirakis weighted sampling).
 *
 * Scores are normalised to [0.35, 1.35] rather than used raw: a spot with ten
 * times the views would otherwise win virtually every draw and the "random"
 * line-up would never actually change.
 */
function weightedShuffle<T>(items: T[], scoreOf: (item: T) => number, random: () => number): T[] {
  if (items.length === 0) {
    return [];
  }

  // A single non-finite score would poison min/max and make every sort
  // comparison return NaN, which silently leaves the array unshuffled.
  const scores = items.map((item) => {
    const score = scoreOf(item);
    return Number.isFinite(score) ? score : 0;
  });
  const min = Math.min(...scores);
  const span = Math.max(...scores) - min || 1;

  return items
    .map((item, index) => {
      const weight = 0.35 + (scores[index] - min) / span;
      return { item, key: -Math.log(Math.max(random(), 1e-12)) / weight };
    })
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
}

export interface SpotPreview {
  id: string;
  spotType: string;
  countryCode: string;
  media: string[];
  /**
   * Counters are absent on older spot documents rather than zero, so every
   * one of these is optional — reading them unguarded produces NaN.
   */
  likesCount?: number;
  shareCount?: number;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  verifiedAt?: number;
  createdBy?: string;
  translation: { name: string };
}

/** A spot plus the derived bits the landing needs to render it. */
export interface FeedSpot extends SpotPreview {
  /** Displayable cover image (image variant, or a video's poster frame). */
  coverUrl: string;
  /** Total media items on the spot (drives the carousel dots). */
  mediaCount: number;
  /** `@handle` of the author, when it could be resolved. */
  authorHandle?: string;
  /** Author's profile picture, when they have one. */
  authorAvatar?: string;
  /** Displayable images for the in-card carousel (the app shows up to 4). */
  gallery?: GalleryImage[];
}

export interface GalleryImage {
  url: string;
  /**
   * How the app frames it: portrait shots fill the screen, wider ones are
   * letterboxed so nothing important gets cropped.
   */
  fit: "cover" | "contain";
}

interface FunctionsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PaginatedSpotsResponse {
  items: SpotPreview[];
  hasMore: boolean;
  nextCursor: number | null;
}

async function callFunction<T>(
  path: string,
  params: Record<string, string>,
  pick: (json: any) => T | undefined = (json) => json.data,
): Promise<T | null> {
  const url = new URL(`${FUNCTIONS_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.warn(`[spots] ${path} responded with ${response.status}`);
      return null;
    }

    const json = (await response.json()) as FunctionsResponse<T>;
    const data = pick(json);

    if (!json.success || data == null) {
      console.warn(`[spots] ${path} returned an unsuccessful response`, json.error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn(`[spots] ${path} failed`, error);
    return null;
  }
}

/* -------------------------------------------------------------------------
 * Media URL derivation
 * ---------------------------------------------------------------------- */

const VIDEO_EXTENSIONS = [
  ".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".m4v", ".3gp",
];

/** Mirrors `MediaUtils.isVideoUrl` in the Flutter app. */
export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/**
 * Image-variant URL, mirroring `image_variant_service.dart`
 * (`.../foo.jpg` -> `.../foo_card.jpg`). Variants are public, so the original's
 * download token is dropped — reusing it on a variant returns 403.
 */
export function spotImageUrl(
  mediaUrl: string,
  variant: "thumb" | "small" | "card" | "medium" | "large" | "xlarge" = "card",
): string {
  const [base, query = ""] = mediaUrl.split("?");
  const lastDot = base.lastIndexOf(".");
  if (lastDot === -1) {
    return mediaUrl;
  }

  const variantBase = `${base.slice(0, lastDot)}_${variant}${base.slice(lastDot)}`;
  return query ? `${variantBase}?alt=media` : variantBase;
}

/**
 * Poster frame for an uploaded video, mirroring `_constructThumbnailUrl` in the
 * Flutter app: `spots/{id}/media/videos/{name}.{ext}` becomes
 * `spots/{id}/media/thumbnails/{name}_thumbnail.png`. Thumbnails are written by
 * the Admin SDK without a download token and are publicly readable, so the URL
 * must end in a bare `?alt=media`.
 */
export function videoThumbnailUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const segments = url.pathname.split("/");
    const bucketIndex = segments.indexOf("b");
    const objectIndex = segments.indexOf("o");

    if (bucketIndex === -1 || objectIndex === -1) {
      return null;
    }

    const bucket = segments[bucketIndex + 1];
    const objectPath = decodeURIComponent(segments[objectIndex + 1] ?? "");
    const match = objectPath.match(/^(spots|regions)\/([^/]+)\/media\/videos\/(.+)\.(\w+)$/);

    if (!match) {
      return null;
    }

    const thumbPath = `${match[1]}/${match[2]}/media/thumbnails/${match[3]}_thumbnail.png`;
    return `${url.protocol}//${url.host}/v0/b/${bucket}/o/${encodeURIComponent(thumbPath)}?alt=media`;
  } catch {
    return null;
  }
}

type ImageVariant = "thumb" | "small" | "card" | "medium" | "large" | "xlarge";

/** Variants are tried largest-first from the requested size downwards. */
const VARIANT_ORDER: ImageVariant[] = ["xlarge", "large", "medium", "card", "small", "thumb"];

const urlExistsCache = new Map<string, boolean>();

/**
 * Image variants are generated on upload, so older media may be missing the
 * larger sizes. A build-time HEAD check keeps us from emitting a 404 URL.
 */
async function urlExists(url: string): Promise<boolean> {
  const cached = urlExistsCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  let exists = false;
  try {
    const response = await fetch(url, { method: "HEAD" });
    exists = response.ok;
  } catch {
    exists = false;
  }

  urlExistsCache.set(url, exists);
  return exists;
}

export interface ImageInfo {
  width: number;
  height: number;
  bytes: number;
}

const imageInfoCache = new Map<string, ImageInfo | null>();

/**
 * Reads an image's real pixel size from its header, without downloading the
 * whole file. Uploads are capped at 1080px on the long side, so most spot
 * photos are portrait — the pixel count alone doesn't tell you whether a photo
 * suits a full-bleed backdrop, the aspect ratio does.
 */
export async function imageInfo(url: string): Promise<ImageInfo | null> {
  const cached = imageInfoCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  let info: ImageInfo | null = null;

  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) {
      const bytes = Number(head.headers.get("content-length") ?? 0);
      const response = await fetch(url, { headers: { Range: "bytes=0-131071" } });

      if (response.ok) {
        const dimensions = parseImageDimensions(
          Buffer.from(await response.arrayBuffer()),
        );
        if (dimensions) {
          info = { ...dimensions, bytes };
        }
      }
    }
  } catch {
    info = null;
  }

  imageInfoCache.set(url, info);
  return info;
}

function parseImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  // PNG — IHDR carries the size at a fixed offset.
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // JPEG — walk the segment chain to the start-of-frame marker.
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;

    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }

      const isStartOfFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

      if (isStartOfFrame) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  return null;
}

/**
 * Best displayable cover for a spot: the first still image at the largest
 * available variant at or below the requested size, falling back to the
 * original file and then to the poster frame of the first video.
 */
export async function coverUrlFor(
  media: string[],
  variant: ImageVariant = "card",
): Promise<string | null> {
  const firstImage = media.find((url) => !isVideoUrl(url));

  if (firstImage) {
    const startIndex = VARIANT_ORDER.indexOf(variant);
    const candidates = VARIANT_ORDER.slice(startIndex < 0 ? 0 : startIndex);

    for (const candidate of candidates) {
      const url = spotImageUrl(firstImage, candidate);
      if (await urlExists(url)) {
        return url;
      }
    }

    // Every variant is missing — the original always exists.
    return firstImage;
  }

  for (const url of media) {
    const poster = videoThumbnailUrl(url);
    if (poster && (await urlExists(poster))) {
      return poster;
    }
  }

  return null;
}

/** Public spot URL on the web app, matching `url_helper.dart`. */
export function spotUrl(id: string): string {
  return `https://web.outzero.app/spot/${id}`;
}

/* -------------------------------------------------------------------------
 * Fetchers
 * ---------------------------------------------------------------------- */

async function fetchTopSpotsByType(
  spotType: string,
  lang: Locale,
  limit: number,
): Promise<SpotPreview[]> {
  const data = await callFunction<SpotPreview[]>("getTopSpotsByType", {
    spotType,
    lang,
    limit: String(limit),
  });

  return data ?? [];
}

/**
 * Everything the landing needs, allocated in one pass so a spot never shows up
 * in two sections at once.
 */
export interface LandingSpots {
  /** One entry per SPOT_TYPES category, in the same order; null when empty. */
  tiles: Array<FeedSpot | null>;
  /** Cards for the "El feed" grid. */
  grid: FeedSpot[];
  /** Spots played inside the phone mockup. */
  miniFeed: FeedSpot[];
  /** Backdrops for the hero, story and CTA sections. */
  showcase: Record<ShowcaseSlot, ShowcaseImage | null>;
  /** Small thumbnail for the mockup's account tab. */
  accountAvatar: string | null;
}

const landingCache = new Map<Locale, Promise<LandingSpots>>();

export function fetchLandingSpots(lang: Locale): Promise<LandingSpots> {
  // Same reasoning as the showcase memo: caching keeps both locales on the
  // same spots within a build, but must not freeze the dev server.
  if (REDRAW_EVERY_RENDER) {
    return buildLandingSpots(lang);
  }

  let cached = landingCache.get(lang);
  if (!cached) {
    cached = buildLandingSpots(lang);
    landingCache.set(lang, cached);
  }

  return cached;
}

async function buildLandingSpots(lang: Locale): Promise<LandingSpots> {
  // A single registry threaded through every picker. Ordered most-constrained
  // first: category tiles can only use spots of their own type, while the
  // showcase backdrops draw from the whole catalogue.
  const used = new Set<string>();

  const tiles = await pickTiles(lang, used);
  const grid = await pickGrid(lang, used);
  const miniFeed = await pickMiniFeed(lang, used);
  const showcase = await resolveShowcaseImages(lang, used);
  const accountAvatar = await pickAccountThumbnail(lang, used);

  return { tiles, grid, miniFeed, showcase, accountAvatar };
}

/** One well-ranked spot per category, drawn at random from the top of its pool. */
async function pickTiles(lang: Locale, used: Set<string>): Promise<Array<FeedSpot | null>> {
  const tiles: Array<FeedSpot | null> = [];

  for (const type of TILE_SPOT_TYPES) {
    const spots = (await fetchTopSpotsByType(type.code, lang, 12)).filter(
      (spot) => !used.has(spot.id) && hasDisplayableMedia(spot.media),
    );

    const ordered = weightedShuffle(
      spots,
      (spot) => scoreSpot({ ...spot, coverUrl: "", mediaCount: spot.media.length }),
      rngFor(`tile:${type.code}`),
    );

    let picked: FeedSpot | null = null;

    for (const spot of ordered) {
      const coverUrl = await coverUrlFor(spot.media, "card");
      if (coverUrl) {
        picked = { ...spot, coverUrl, mediaCount: spot.media.length };
        used.add(spot.id);
        break;
      }
    }

    tiles.push(picked);
  }

  return tiles;
}

/**
 * Spots for the "El feed" grid. Pulls the top spots of every category and then
 * picks a spread that maximises variety: one country and one spot type at a
 * time, so the grid never fills up with eight beaches from the same place.
 */
async function pickGrid(lang: Locale, used: Set<string>): Promise<FeedSpot[]> {
  const perType = await Promise.all(
    SPOT_TYPES.map((type) => fetchTopSpotsByType(type.code, lang, 12)),
  );

  const candidates: FeedSpot[] = [];
  const seenIds = new Set<string>();

  for (const spots of perType) {
    for (const spot of spots) {
      // Cheap pre-filter; the exact variant is resolved after the selection so
      // we only spend HEAD requests on spots that actually get rendered.
      if (used.has(spot.id) || seenIds.has(spot.id) || !hasDisplayableMedia(spot.media)) {
        continue;
      }
      seenIds.add(spot.id);
      candidates.push({ ...spot, coverUrl: "", mediaCount: spot.media.length });
    }
  }

  const picked = await resolveCovers(pickVariedSpots(candidates, 8), "card");

  for (const spot of picked) {
    used.add(spot.id);
  }

  return picked;
}

/**
 * Greedy selection that prefers unseen countries and unseen spot types, then
 * relaxes those constraints once every option has been used. The candidate
 * order is a weighted shuffle, so the grid changes between builds while still
 * favouring the better spots.
 */
function pickVariedSpots(candidates: FeedSpot[], limit: number): FeedSpot[] {
  const ranked = weightedShuffle(candidates, scoreSpot, rngFor("feed"));

  const picked: FeedSpot[] = [];
  const usedCountries = new Set<string>();
  const usedTypes = new Set<string>();

  // Three passes, each loosening the diversity requirement.
  const passes: Array<(spot: FeedSpot) => boolean> = [
    (spot) => !usedCountries.has(spot.countryCode) && !usedTypes.has(spot.spotType),
    (spot) => !usedCountries.has(spot.countryCode) || !usedTypes.has(spot.spotType),
    () => true,
  ];

  for (const accepts of passes) {
    for (const spot of ranked) {
      if (picked.length >= limit) {
        return picked;
      }
      if (picked.includes(spot) || !accepts(spot)) {
        continue;
      }

      picked.push(spot);
      usedCountries.add(spot.countryCode);
      usedTypes.add(spot.spotType);
    }
  }

  return picked;
}

/** True when the spot has a photo, or a video whose poster we can derive. */
function hasDisplayableMedia(media: string[]): boolean {
  return media.some((url) => !isVideoUrl(url) || videoThumbnailUrl(url) != null);
}

async function resolveCovers(spots: FeedSpot[], variant: ImageVariant): Promise<FeedSpot[]> {
  const resolved = await Promise.all(
    spots.map(async (spot) => ({
      ...spot,
      coverUrl: (await coverUrlFor(spot.media, variant)) ?? "",
    })),
  );

  return resolved.filter((spot) => spot.coverUrl !== "");
}

function scoreSpot(spot: FeedSpot): number {
  return (
    (spot.viewCount ?? 0) * 0.5 +
    (spot.likesCount ?? 0) * 3 +
    (spot.averageRating ?? 0) * (spot.reviewCount ?? 0) * 2 +
    // Spots with several photos look better in a carousel.
    Math.min(spot.mediaCount, 4)
  );
}

/**
 * A small batch of spots for the phone-mockup feed demo, with author handles
 * resolved so the card matches the real app.
 */
async function pickMiniFeed(lang: Locale, used: Set<string>): Promise<FeedSpot[]> {
  const limit = 12;
  const data = await callFunction<PaginatedSpotsResponse>("getVerifiedSpotsPaginated", {
    lang,
    limit: "250",
  });

  const candidates = (data?.items ?? [])
    .filter((spot) => !used.has(spot.id) && hasDisplayableMedia(spot.media))
    .map((spot) => ({ ...spot, coverUrl: "", mediaCount: spot.media.length }));

  const ordered = weightedShuffle(candidates, scoreSpot, rngFor("mini-feed"));

  const usable: FeedSpot[] = [];
  const seenCountries = new Set<string>();

  // Prefer one spot per country, then top up if the catalogue can't fill the
  // demo with that many distinct countries.
  for (const spot of ordered) {
    if (seenCountries.has(spot.countryCode)) {
      continue;
    }

    seenCountries.add(spot.countryCode);
    usable.push(spot);

    if (usable.length >= limit) {
      break;
    }
  }

  for (const spot of ordered) {
    if (usable.length >= limit) {
      break;
    }
    if (!usable.includes(spot)) {
      usable.push(spot);
    }
  }

  const withCovers = await resolveCovers(usable, "large");
  const spots = await withAuthorHandles(await withGalleries(withCovers));

  for (const spot of spots) {
    used.add(spot.id);
  }

  return spots;
}

/**
 * A small thumbnail from a random verified spot, used to fill the account
 * avatar in the phone mockup's bottom nav.
 */
async function pickAccountThumbnail(lang: Locale, used: Set<string>): Promise<string | null> {
  const pool = (await showcasePool(lang)).filter(
    (spot) => !used.has(spot.id) && spot.media.some((url) => !isVideoUrl(url)),
  );

  if (pool.length === 0) {
    return null;
  }

  const random = rngFor("account-avatar");

  // Walk a shuffled pool so a spot whose thumb variant is missing just moves
  // to the next candidate.
  for (const spot of weightedShuffle(pool, () => 1, random).slice(0, 8)) {
    const thumbnail = await coverUrlFor(spot.media, "thumb");
    if (thumbnail) {
      used.add(spot.id);
      return thumbnail;
    }
  }

  return null;
}

export type ShowcaseSlot = "hero" | "story" | "cta";

/** An editorial backdrop plus what's needed to credit the spot it came from. */
export interface ShowcaseImage {
  url: string;
  spotId: string;
  name: string;
  authorHandle?: string;
}

/** Spot types each editorial backdrop draws from, in order of preference. */
const SHOWCASE_SOURCES: Record<ShowcaseSlot, string[]> = {
  // Lakes and beaches are listed last as extra sources of landscape shots.
  hero: ["VWP", "SUM", "LAK"],
  story: ["LAK", "NAT", "BEA"],
  cta: ["SUM", "WTF", "VWP", "BEA"],
};

/**
 * Large photos from real top-ranked spots for the hero, story and CTA
 * backdrops, instead of stock imagery.
 */
async function resolveShowcaseImages(
  lang: Locale,
  used: Set<string>,
): Promise<Record<ShowcaseSlot, ShowcaseImage | null>> {
  const result: Record<ShowcaseSlot, ShowcaseImage | null> = {
    hero: null,
    story: null,
    cta: null,
  };

  for (const slot of ["hero", "story", "cta"] as ShowcaseSlot[]) {
    const picked = await pickShowcaseImage(lang, SHOWCASE_SOURCES[slot], slot, used);
    result[slot] = picked;

    const info = picked ? await imageInfo(picked.url) : null;
    console.info(
      `[spots] ${slot} backdrop: ${
        info ? `${info.width}x${info.height} (${(info.bytes / 1024 / 1024).toFixed(2)}MB)` : "none"
      }`,
    );
  }

  return result;
}

/**
 * What each slot needs from a photo. Uploads are capped at 1080px on the long
 * side, so the binding constraint is orientation, not megapixels: the
 * full-bleed backdrops need landscape shots, while the story card is a 4/5
 * portrait frame and wants tall ones.
 */
interface ShowcaseRequirement {
  minWidth: number;
  minRatio?: number;
  maxRatio?: number;
  /** Guards page weight: these are original uploads, occasionally huge. */
  maxBytes?: number;
}

const MB = 1024 * 1024;

const SHOWCASE_REQUIREMENTS: Record<ShowcaseSlot, ShowcaseRequirement[]> = {
  // Progressively relaxed, so a thin catalogue still yields a backdrop.
  // The first tier is deliberately wide enough that several photos qualify —
  // a stricter bar would leave one eligible photo and freeze the rotation.
  // The hero is the LCP element and loads eagerly, so it gets a tighter
  // weight budget than the lazily-loaded CTA panel.
  hero: [
    { minWidth: 1400, minRatio: 1.3, maxBytes: 1.2 * MB },
    { minWidth: 1080, minRatio: 1.2, maxBytes: 1.5 * MB },
    { minWidth: 900, minRatio: 1, maxBytes: 2.5 * MB },
  ],
  cta: [
    { minWidth: 1400, minRatio: 1.3, maxBytes: 2.5 * MB },
    { minWidth: 1080, minRatio: 1.2, maxBytes: 2.5 * MB },
    { minWidth: 900, minRatio: 1, maxBytes: 4 * MB },
  ],
  story: [
    { minWidth: 700, maxRatio: 1, maxBytes: 1.5 * MB },
    { minWidth: 600, maxRatio: 1.1, maxBytes: 2 * MB },
    { minWidth: 600 },
  ],
};

/** How many photos we're willing to measure per slot before giving up. */
const SHOWCASE_MEASURE_BUDGET = 60;

const showcasePoolPromises = new Map<Locale, Promise<SpotPreview[]>>();

/**
 * A broad pool of verified spots for the editorial backdrops. Ranked
 * per-type queries only surface a dozen spots each, which is far too narrow
 * once the landscape-orientation filter is applied.
 *
 * Cached per locale so the credit can name the spot in the reader's language.
 * The endpoint orders by verification date regardless of `lang`, so both
 * locales walk the same spots in the same order and pick the same photos.
 */
function showcasePool(lang: Locale): Promise<SpotPreview[]> {
  let pool = showcasePoolPromises.get(lang);
  if (!pool) {
    pool = loadShowcasePool(lang);
    showcasePoolPromises.set(lang, pool);
  }
  return pool;
}

async function loadShowcasePool(lang: Locale): Promise<SpotPreview[]> {
  const items: SpotPreview[] = [];
  let cursor: number | null = null;

  // Paginated rather than a single page: the endpoint returns newest-first, so
  // one page would only ever draw from the most recently verified spots.
  for (let page = 0; page < 6; page++) {
    const params: Record<string, string> = { lang, limit: "250" };
    if (cursor != null) {
      params.startAfterVerifiedAt = String(cursor);
    }

    const result = await callFunction<PaginatedSpotsResponse>(
      "getVerifiedSpotsPaginated",
      params,
    );

    if (!result) {
      break;
    }

    items.push(...result.items);

    if (!result.hasMore || result.nextCursor == null) {
      break;
    }
    cursor = result.nextCursor;
  }

  console.info(`[spots] showcase pool: ${items.length} verified spots`);
  return items;
}

async function pickShowcaseImage(
  lang: Locale,
  spotTypes: string[],
  slot: ShowcaseSlot,
  used: Set<string>,
): Promise<ShowcaseImage | null> {
  const random = rngFor(`showcase:${slot}`);
  const pool = (await showcasePool(lang)).filter(
    (spot) => !used.has(spot.id) && spot.media.some((url) => !isVideoUrl(url)),
  );

  // Spots of the slot's preferred types first, then everything else, so the
  // hero still leans on miradores/cumbres without being limited to them.
  const preferred = pool.filter((spot) => spotTypes.includes(spot.spotType));
  const rest = pool.filter((spot) => !spotTypes.includes(spot.spotType));
  const score = (spot: SpotPreview) =>
    scoreSpot({ ...spot, coverUrl: "", mediaCount: spot.media.length });

  const candidates = [
    ...weightedShuffle(preferred, score, random),
    ...weightedShuffle(rest, score, random),
  ]
    // The first image is the spot's cover, the one the app leads with.
    .map((spot) => ({ spot, photo: spot.media.find((url) => !isVideoUrl(url)) }))
    .filter((entry): entry is { spot: SpotPreview; photo: string } => entry.photo != null)
    .slice(0, SHOWCASE_MEASURE_BUDGET);

  const credited = async (entry: {
    spot: SpotPreview;
    photo: string;
  }): Promise<ShowcaseImage> => {
    used.add(entry.spot.id);
    const author = entry.spot.createdBy ? await fetchAuthor(entry.spot.createdBy) : null;

    return {
      url: entry.photo,
      spotId: entry.spot.id,
      name: entry.spot.translation.name,
      authorHandle: author?.handle ?? undefined,
    };
  };

  // The original upload is the highest resolution available — the `_xlarge`
  // variant caps at 1280px, which visibly softens a full-bleed backdrop.
  for (const requirement of SHOWCASE_REQUIREMENTS[slot]) {
    for (const candidate of candidates) {
      const info = await imageInfo(candidate.photo);
      if (!info) {
        continue;
      }

      const ratio = info.width / info.height;
      const fits =
        info.width >= requirement.minWidth &&
        (requirement.minRatio == null || ratio >= requirement.minRatio) &&
        (requirement.maxRatio == null || ratio <= requirement.maxRatio) &&
        (requirement.maxBytes == null || info.bytes <= requirement.maxBytes);

      if (fits) {
        return credited(candidate);
      }
    }
  }

  // Nothing measured up — fall back to whatever the best candidate offers.
  return candidates[0] ? credited(candidates[0]) : null;
}

/** The app's in-card carousel shows at most four media items. */
const MAX_GALLERY_ITEMS = 4;

async function withGalleries(spots: FeedSpot[]): Promise<FeedSpot[]> {
  return Promise.all(
    spots.map(async (spot) => {
      const photos = spot.media.filter((url) => !isVideoUrl(url)).slice(0, MAX_GALLERY_ITEMS);

      const resolved = await Promise.all(
        photos.map(async (photo): Promise<GalleryImage | null> => {
          const url = await coverUrlFor([photo], "large");
          if (!url) {
            return null;
          }

          // Measured on the original: the variant is a straight downscale, so
          // the aspect ratio is the same.
          const info = await imageInfo(photo);
          const isPortrait = info != null && info.width / info.height < 1;

          return { url, fit: isPortrait ? "cover" : "contain" };
        }),
      );

      const gallery = resolved.filter((image): image is GalleryImage => image != null);

      return {
        ...spot,
        gallery: gallery.length > 0 ? gallery : [{ url: spot.coverUrl, fit: "contain" }],
      };
    }),
  );
}

interface AuthorInfo {
  handle: string | null;
  avatar: string | null;
}

const authorCache = new Map<string, AuthorInfo>();

async function withAuthorHandles(spots: FeedSpot[]): Promise<FeedSpot[]> {
  return Promise.all(
    spots.map(async (spot) => {
      if (!spot.createdBy) {
        return spot;
      }

      const author = await fetchAuthor(spot.createdBy);
      return {
        ...spot,
        authorHandle: author.handle ?? undefined,
        authorAvatar: author.avatar ?? undefined,
      };
    }),
  );
}

async function fetchAuthor(userId: string): Promise<AuthorInfo> {
  const cached = authorCache.get(userId);
  if (cached) {
    return cached;
  }

  const user = await callFunction<{ username?: string | null; profileImageUrl?: string | null }>(
    "getUserProfile",
    { userId },
    (json) => json.user,
  );

  const profileImage = user?.profileImageUrl ?? null;
  const author: AuthorInfo = {
    handle: user?.username ? `@${user.username}` : null,
    // A 28px avatar only needs the smallest variant, which older uploads may
    // not have — coverUrlFor walks down to whatever actually exists.
    avatar:
      profileImage && !isVideoUrl(profileImage)
        ? await coverUrlFor([profileImage], "thumb")
        : null,
  };

  authorCache.set(userId, author);
  return author;
}

/* -------------------------------------------------------------------------
 * Display helpers
 * ---------------------------------------------------------------------- */

const regionDisplayNames = new Map<Locale, Intl.DisplayNames>();

export function countryDisplayName(countryCode: string, locale: Locale): string {
  if (!countryCode) {
    return "";
  }

  let displayNames = regionDisplayNames.get(locale);
  if (!displayNames) {
    displayNames = new Intl.DisplayNames([locale], { type: "region" });
    regionDisplayNames.set(locale, displayNames);
  }

  try {
    return displayNames.of(countryCode.toUpperCase()) ?? countryCode;
  } catch {
    return countryCode;
  }
}

/** Compact counter format used by the app feed (1.2K / 3.4M). */
export function formatCount(count?: number): string {
  const value = Number.isFinite(count) ? (count as number) : 0;

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

export interface SpotTypeDefinition {
  code: string;
  icon: string;
  i18nKey: keyof Pick<
    Translations,
    | "spot_viewpoint"
    | "spot_beach"
    | "spot_waterfalls"
    | "spot_summit"
    | "spot_surf"
    | "spot_cliff_jumping"
    | "spot_lake"
    | "spot_natural_pools"
    | "spot_caves"
    | "spot_diving"
    | "spot_camping"
    | "spot_adventure"
  >;
}

/**
 * The 12 real `SpotType` codes from Firestore, in the design's order.
 * The design mocked a "Trekking" tile, but no such code exists in the app's
 * `SpotType` enum — `CMP` (Camping) is the real twelfth category.
 */
export const SPOT_TYPES: SpotTypeDefinition[] = [
  { code: "VWP", icon: "viewpoint", i18nKey: "spot_viewpoint" },
  { code: "BEA", icon: "beach", i18nKey: "spot_beach" },
  { code: "WTF", icon: "waterfall", i18nKey: "spot_waterfalls" },
  { code: "SUM", icon: "summit", i18nKey: "spot_summit" },
  { code: "SUR", icon: "surf", i18nKey: "spot_surf" },
  { code: "CLJ", icon: "cliff_jumping", i18nKey: "spot_cliff_jumping" },
  { code: "LAK", icon: "lake", i18nKey: "spot_lake" },
  { code: "NAT", icon: "natural_pools", i18nKey: "spot_natural_pools" },
  { code: "CAV", icon: "caves", i18nKey: "spot_caves" },
  { code: "DIV", icon: "diving", i18nKey: "spot_diving" },
  { code: "CMP", icon: "camping", i18nKey: "spot_camping" },
  { code: "ADV", icon: "adventure", i18nKey: "spot_adventure" },
];

/**
 * Categories shown as flip tiles. Camping is deliberately left out — it isn't
 * really an activity like the rest — but it stays in SPOT_TYPES so a camping
 * spot appearing elsewhere still resolves its icon and name.
 */
export const TILE_SPOT_TYPES: SpotTypeDefinition[] = SPOT_TYPES.filter(
  (type) => type.code !== "CMP",
);

export function spotTypeDefinition(code: string): SpotTypeDefinition | undefined {
  return SPOT_TYPES.find((type) => type.code === code);
}

/**
 * Singular name of a spot type, for a tag describing one spot
 * ("Mirador", not "Miradores").
 */
export function spotTypeLabelSingular(code: string, strings: Translations): string {
  const definition = spotTypeDefinition(code);
  if (!definition) {
    return code;
  }

  const singularKey = definition.i18nKey.replace(
    "spot_",
    "spot_one_",
  ) as keyof Translations;

  return (strings[singularKey] as string | undefined) ?? strings[definition.i18nKey];
}
