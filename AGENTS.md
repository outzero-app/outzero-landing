# AGENTS.md — Outzero Landing Page

Instructions for AI coding agents working on the Outzero landing page (Astro + Tailwind CSS v4).

## Project Overview

Static landing page for [outzero.app](https://outzero.app). Built with **Astro 6** (zero-JS static output) and **Tailwind CSS v4** (via `@tailwindcss/vite`). Deployed via **GitHub Pages**.

## Build / Dev Commands

```bash
npm run dev        # Start dev server (localhost:4321)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

## Project Structure

```
outzero-landing/
├── public/
│   ├── fonts/              # Poppins TTF (Light, SemiBold, Bold)
│   ├── icons/spots/        # Spot type SVG icons (from Flutter app)
│   ├── icons/navigation/   # Nav glyphs: eye, location, home_active, explore, route, profile
│   ├── icons/ui/           # UI glyphs: filter, like, add, satellite, search, send
│   ├── images/             # Logos (SVG/PNG), icon mark
│   ├── favicon.png         # Browser tab icon
│   └── og-image.png        # Open Graph preview (1200x630)
├── src/
│   ├── components/         # Astro components (Navbar, Hero, etc.)
│   ├── i18n/
│   │   └── translations.ts # All copy, ES/EN, typed
│   ├── layouts/
│   │   └── Layout.astro    # Base HTML layout (head, meta, fonts, locale redirect)
│   ├── lib/
│   │   ├── legal-documents.ts # Legal markdown fetched from GitHub at build time
│   │   └── spots.ts        # Firebase spot data fetched at build time
│   ├── pages/
│   │   └── index.astro     # Landing page entry point
│   └── styles/
│       └── global.css      # Design system (CSS vars + Tailwind config)
├── astro.config.mjs        # Astro configuration
├── package.json
└── AGENTS.md               # This file
```

## Design System

### Source of Truth

The design system is defined in `src/styles/global.css` and mirrors `lib/src/theme/app_theme.dart` from the Flutter app. **NEVER hardcode colors, fonts or spacing**.

### Colors — CSS Custom Properties

All colors are exposed as CSS custom properties on `:root` (dark theme) and `[data-theme="light"]` (light theme).

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--background` | `#000000` | `#FFFFFF` | Page background |
| `--surface` | `#424242` | `#B3B4B5` | Cards, elevated UI |
| `--text-primary` | `#FFFFFF` | `#000000` | Main text |
| `--text-secondary` | `#B3B4B5` | `#424242` | Secondary text |
| `--tag-green` | `#CDFAB1` | `#2B4F0A` | Brand accent, CTAs |
| `--tag-green-fg` | `#000000` | `#FFFFFF` | Text ON tag-green |
| `--border` | `#424242` | `#424242` | Borders, dividers |
| `--button-bg` | `#424242` | `#73ABBF` | Secondary buttons |
| `--button-text` | `#FFFFFF` | `#FFFFFF` | Button text |

Additional tokens: `--error`, `--success`, `--warning`, `--pending`, `--social-button`, `--admin-action`.

Raw palette tokens (for gradients/effects only): `--color-brand-green`, `--color-accent-blue`, etc.

### Typography

- **Font**: Poppins (bundled in `/public/fonts/`)
  - `font-weight: 300` — body, paragraphs (Poppins Light)
  - `font-weight: 600` — headings, buttons, labels (Poppins SemiBold)
  - `font-weight: 700` — strong emphasis (Poppins Bold)

### Border Radius

`--radius-brand` (8px) is the default — buttons, inputs, small chips. The scale also has
`--radius-xs` 4, `--radius-md` 12, `--radius-lg` 16 (feature/category tiles), `--radius-xl` 20,
`--radius-2xl` 24 (spot cards, photo panels) and `--radius-full` 999 (pills, avatars).

### Elevation, motion and hairlines

`--shadow-sm/md/lg` and `--shadow-card` for elevation; `--border-subtle` for the hairline used
over photos; `--ease-out` plus `--duration-fast/base/slow` for transitions. Never inline a raw
`cubic-bezier` or shadow.

### Buttons

Use the shared `.btn` classes from `global.css`: `.btn.btn-primary` / `.btn.btn-outline`,
sized with `.btn-sm` / `.btn-lg`. Do not re-implement button styling per component.

### Using Colors in Templates

```html
<!-- Tailwind arbitrary values (preferred for bg/text) -->
<div class="bg-[var(--surface)] text-[var(--text-primary)]">

<!-- Inline style (fallback when Tailwind syntax is verbose) -->
<span style="color: var(--tag-green);">Highlighted</span>
```

### Spot Type Icons

SVG icons at `/icons/spots/{name}.svg`. They have `fill="#fff"` baked in.

- **White/black (theme-following)**: `<img class="spot-icon">` — applies `filter: brightness(0) invert(1)` (dark) / `filter: brightness(0)` (light).
- **Brand green**: `<span class="oz-icon-mask oz-icon-mask--green" style="--icon-url: url('/icons/spots/x.svg')">`. This masks the SVG and paints it with `currentColor`, so it follows `--tag-green` in both themes — a CSS `filter` cannot hit an arbitrary token.

Inside the phone mockup (`AppPreview.astro`) the screen is black in *both* themes, so icons there
are pinned to white / `--color-brand-green` rather than the theme-following tokens.

### Theme Switching

The landing defaults to dark theme (`data-theme="dark"` on `<html>`). To support light theme, change the attribute to `data-theme="light"`. All semantic tokens and `.spot-icon` / `.logo-img` / `.footer-logo` / `.hero-icon` classes auto-adapt.

## Code Style

- **Components**: One component per `.astro` file in `src/components/`
- **No frameworks**: Pure Astro components (zero JS shipped by default)
- **Minimal JS**: Inline `<script>` tags, no framework. Two components carry real behaviour:
  - `SpotTypes.astro` — pointer devices reveal a category's spot **on hover** (pure CSS); touch
    devices tap to reveal, keeping at most three open and flipping each back after 3s. Reveal state
    uses `:has(.back-link:focus-visible)`, not `:focus-within`, or a tile stays open after you
    return from the spot's tab.
  - `AppPreview.astro` — the phone feed plays itself at irregular intervals, advancing through a
    spot's photos and then down to the next, with a clone of the first panel parked at the end so
    the wrap is a seamless downward scroll rather than a rewind. It also fakes occasional likes,
    which reset on each pass.
- **Never gate content behind `prefers-reduced-motion`.** `global.css` already neutralises
  transition durations; a script that refuses to run leaves the section looking broken for anyone
  with Windows' "reduce animations" on (which Edge and Chrome honour and Firefox ignores).
- **Use real `<a>` elements for outbound clicks**, not `window.open` — pop-up blockers swallow the
  latter silently, and links also give middle-click and "open in new tab".
- **Responsive**: Mobile-first. Breakpoints: `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280).
  The navbar sheds elements as space runs out: section links move into a toggle menu below 880px,
  the language pill joins them below 440px, and the CTA follows below 360px.
- **Viewport fit**: `--navbar-height` in `global.css` is the single source for the fixed bar's
  height — it feeds `scroll-padding-top` (so anchors and scroll-snap land under the navbar) and the
  hero's top padding. Do **not** also set `scroll-margin-top` on sections; both apply and the target
  ends up offset twice. Sections carry `scroll-snap-align: start` with `proximity` snapping, so
  Space/Page Down land on a section boundary without trapping long sections.
- **The hero always fits one screen** (`max-height: 100svh`); its title is sized with
  `clamp(38px, min(7.2vw, 8.6vh), 86px)` so it shrinks on short viewports instead of overflowing.
- **Accessibility**: Semantic HTML, `alt` attributes, `aria-label` on icon-only links, `aria-hidden` on decorative elements.
- **Images**: Use `loading="lazy"` for below-the-fold images.

## Spot Data (Firebase)

Real spots are fetched **at build time** in `src/lib/spots.ts` — never from the browser. This keeps
the site fully static, avoids CORS, and means no Firebase SDK or credentials ship to the client.
Data comes from the already-deployed Cloud Functions in `europe-west1`, which only return
`statusCode === 'VERIFIED'` spots:

| Function | Used for |
|----------|----------|
| `getTopSpotsByType` | Category flip tiles, feed grid, editorial backdrops |
| `getVerifiedSpotsPaginated` | Phone mockup mini-feed |
| `getUserProfile` | Author handle on the mini-feed card |

### Which spots get featured

The selection is **randomised per build**, so the daily rebuild refreshes the page even when the
underlying data hasn't changed, and two local builds show two different line-ups. Candidates are
drawn with a weighted shuffle biased towards views/likes/ratings, then filtered for country and
spot-type variety.

```bash
npm run dev                            # re-draws on every page refresh
npm run build                          # new line-up every time
OUTZERO_SPOT_SEED=12345 npm run build  # reproduce a specific one (also works with dev)
```

Every build prints the seed it used (`[spots] build seed …`), so a line-up you liked can always be
reproduced. Within a build the seed is keyed per purpose (`feed`, `tile:VWP`, `mini-feed`,
`showcase:hero`, …) rather than one advancing stream, so `/` and `/es/` always feature the same
spots. `astro dev` instead re-draws on every render, which makes previewing variety a page refresh
— pin `OUTZERO_SPOT_SEED` when you need dev to hold still.

⚠️ Spot counters (`likesCount`, `averageRating`, `reviewCount`, `viewCount`, `shareCount`) are
**absent** on older documents, not zero — that's why they're optional in `SpotPreview`. Always
coalesce them; a single `NaN` reaching a sort comparator makes every comparison false and silently
leaves the list unsorted.

**A spot never appears twice on the page.** `fetchLandingSpots()` allocates every section in one
pass, threading a shared `used` set through the pickers from most constrained to least (category
tiles → feed grid → phone demo → editorial backdrops → account avatar). Components read from that
one result rather than fetching their own spots.

The three editorial photos are credited with `PhotoCredit.astro`, which links back to the spot, so
`ShowcaseImage` carries the spot id, its localized name and the author handle — that's why the
showcase pool is cached per locale.

Rules when touching this layer:

- **Every fetch must degrade gracefully.** A failure logs a warning and returns `null`/`[]`; the
  consuming section then renders nothing rather than breaking the build.
- **Image URLs must be resolved, not guessed.** Variants (`_card`, `_large`, …) are generated on
  upload, so older media is missing the larger sizes. `coverUrlFor()` HEAD-checks and walks down
  the variant scale, falling back to the original. Variant URLs drop the original's `token` —
  reusing it returns 403.
- **Full-bleed backdrops use the original file, not a variant.** `_xlarge` caps at 1280px, which
  visibly softens a 100svh hero. `imageInfo()` reads the real pixel size from the file header via a
  ranged request, and `SHOWCASE_REQUIREMENTS` filters on width, aspect ratio and byte size.
  The app uploads at `maxWidth: 1920, maxHeight: 1080`, so **most spot photos are portrait**
  (810x1080, 608x1080): orientation, not megapixels, is what makes a photo unusable as a wide
  backdrop. Hero/CTA demand landscape, the story card demands portrait.
  Keep the top requirement tier loose enough that several photos qualify — a stricter bar leaves a
  single eligible photo and freezes the rotation on one image.
- **Videos have no image variants.** `media[0]` may be an `.mp4`; appending `_card` to it 404s.
  Derive the poster with `videoThumbnailUrl()` (`media/videos/x.mp4` →
  `media/thumbnails/x_thumbnail.png`, ending in a bare `?alt=media`), mirroring
  `_constructThumbnailUrl` in the Flutter app.
- **Spot types are the 12 real `SpotType` codes.** The design mocked a "Trekking" tile, but no such
  code exists in the app's enum — `CMP` (Camping) is the real twelfth category.

`.github/workflows/deploy.yml` runs a daily cron so the featured spots stay fresh without a push.

## Assets Origin

All assets are copied from the Flutter app (`outzero_app`):

| Asset | Source |
|-------|--------|
| Poppins fonts | `assets/fonts/Poppins-*.ttf` |
| SVG logos | `assets/images/logos/outzero_logo_*.svg` |
| SVG icon mark | `assets/images/icons/outzero_icon_*.svg` |
| Spot type icons | `assets/icons/spots/*.svg` |
| Navigation icons | `assets/icons/navigation/*.svg` |
| UI icons | `assets/icons/ui/*.svg` |
| Favicon | `web/favicon.png` |
| OG image | `web/og-image.png` |

When updating assets, re-copy from the Flutter project source.

## Internationalization

All copy lives in `src/i18n/translations.ts`, typed by the `Translations` interface, with `en` as
the default (no URL prefix) and `es` under `/es/`. Strings needing inline emphasis are stored as a
single `*_html` string containing `<em>` (brand green) or `<strong>` (primary text) and rendered
with `set:html` — do not split a sentence into lead/highlight/tail fragments.

The language choice travels in the URL (`/es/?lang=es`). `Layout.astro` reads `?lang=` in an
inline head script *before* the browser-language auto-redirect and persists it, then cleans the
URL. Never move that persistence into a deferred component script: the redirect would race it and
bounce the user back to the previous language.

## Deployment

Hosted via **GitHub Pages** from the `outzero-app` GitHub organization. Custom domains: `outzero.app` and `www.outzero.app`.

## Quick Checklist

- [ ] Never hardcode colors, shadows, easings or radii — use CSS custom properties
- [ ] Use `font-weight: 300` for body, `600` for headings/buttons
- [ ] Use the shared `.btn` classes instead of per-component button styles
- [ ] Use `.spot-icon` for white/black icons, `.oz-icon-mask--green` for brand-green ones
- [ ] New copy goes in `translations.ts` for **both** `en` and `es`
- [ ] Spot data fetched in `src/lib/spots.ts` at build time, never client-side
- [ ] Any new spot image goes through `coverUrlFor()` so videos and missing variants are handled
- [ ] Add `alt` text to all meaningful images
- [ ] Test responsiveness at 375px, 768px, 1024px, 1440px
- [ ] Run `npm run build` before committing
