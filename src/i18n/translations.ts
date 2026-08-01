/**
 * Internationalization strings for the Outzero landing page.
 *
 * Follows the same key structure as the Flutter app ARB files where possible.
 * Default locale: "en". Supported: "en", "es".
 */

export const defaultLocale = "en" as const;
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export interface Translations {
  // Meta / SEO
  meta_title: string;
  meta_description: string;

  // Accessibility
  skip_to_content: string;

  // Navbar
  nav_spots: string;
  nav_features: string;
  nav_story: string;
  nav_open_app: string;
  nav_menu: string;

  // Hero
  hero_eyebrow: string;
  hero_headline_1: string;
  hero_headline_2: string;
  hero_subheadline: string;
  hero_cta: string;
  hero_learn_more: string;
  hero_download_ios: string;
  hero_download_android: string;
  hero_web_hint: string;
  hero_proof_exact_locations: string;
  hero_proof_real_videos: string;
  hero_proof_visual_routes: string;
  hero_proof_platforms: string;

  // Spot Types
  spot_types_label: string;
  spot_types_title: string;
  spot_types_subtitle: string;
  spot_surf: string;
  spot_beach: string;
  spot_summit: string;
  spot_viewpoint: string;
  spot_cliff_jumping: string;
  spot_waterfalls: string;
  spot_lake: string;
  spot_natural_pools: string;
  spot_caves: string;
  spot_diving: string;
  spot_camping: string;
  spot_adventure: string;

  // App preview (phone mockup mini-feed)
  preview_label: string;
  preview_title: string;
  preview_subtitle: string;
  preview_map_title: string;
  preview_map_desc: string;
  preview_media_title: string;
  preview_media_desc: string;
  preview_routes_title: string;
  preview_routes_desc: string;
  preview_tab_for_you: string;
  preview_tab_following: string;
  preview_view_on_map: string;
  preview_nav_home: string;
  preview_nav_explore: string;
  preview_nav_trips: string;
  preview_nav_account: string;

  // Spot feed (grid of real spots)
  feed_label: string;
  feed_title: string;
  feed_subtitle: string;

  // Spot type names in the singular, for the tag on a single spot card
  spot_one_viewpoint: string;
  spot_one_beach: string;
  spot_one_waterfalls: string;
  spot_one_summit: string;
  spot_one_surf: string;
  spot_one_cliff_jumping: string;
  spot_one_lake: string;
  spot_one_natural_pools: string;
  spot_one_caves: string;
  spot_one_diving: string;
  spot_one_camping: string;
  spot_one_adventure: string;

  // Web + Mobile
  platforms_label: string;
  platforms_title: string;
  platforms_web_label: string;
  platforms_web_title: string;
  platforms_web_desc: string;
  platforms_web_cta: string;
  platforms_mobile_label: string;
  platforms_mobile_title: string;
  platforms_mobile_desc: string;

  // Features
  features_label: string;
  features_title: string;
  features_subtitle: string;
  feature_map_title: string;
  feature_map_desc: string;
  feature_routes_title: string;
  feature_routes_desc: string;
  feature_media_title: string;
  feature_media_desc: string;
  feature_community_title: string;
  feature_community_desc: string;
  feature_multiplatform_title: string;
  feature_multiplatform_desc: string;
  feature_plus_title: string;
  feature_plus_desc: string;
  /** Same copy with the price emphasised; rendered as HTML. */
  feature_plus_desc_html: string;

  // About. The `_html` strings carry <em> for the brand-green emphasis.
  about_label: string;
  about_headline_html: string;
  about_paragraph_1: string;
  about_paragraph_2_html: string;

  // CTA
  cta_title: string;
  cta_subtitle: string;
  cta_button: string;
  cta_helper: string;

  /** Credit under a photo, e.g. "Spot: Peña Oroel". */
  photo_credit_prefix: string;

  // Footer
  footer_open_app: string;
  footer_privacy: string;
  footer_cookies: string;
  footer_terms: string;
  footer_copyright: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    meta_title: "Outzero — Discover Amazing Spots Around the World",
    meta_description:
      "Discover surf breaks, hidden beaches, waterfalls, summits and other real outdoor spots with exact locations, route context and community videos on web, iOS and Android.",

    skip_to_content: "Skip to content",

    nav_spots: "Spots",
    nav_features: "Features",
    nav_story: "Story",

    nav_open_app: "Open App",
    nav_menu: "Menu",

    hero_eyebrow: "The outdoor community",
    hero_headline_1: "Discover spots that aren't in",
    hero_headline_2: "any guidebook.",
    hero_subheadline:
      "Jaw-dropping viewpoints, hidden beaches, remote waterfalls, summits and secret corners — with exact locations, real videos and visual routes on the map. All shared by a community of adventurers like you.",
    hero_cta: "Open the map →",
    hero_learn_more: "See features",
    hero_download_ios: "Download on the App Store",
    hero_download_android: "Get it on Google Play",
    hero_web_hint: "Open the map on the web in seconds, then keep the trip going on iOS and Android.",
    hero_proof_exact_locations: "Exact locations",
    hero_proof_real_videos: "Real videos",
    hero_proof_visual_routes: "Visual routes",
    hero_proof_platforms: "Web, iOS and Android",

    spot_types_label: "Spot types",
    spot_types_title: "Every type of adventure, on a single map",
    spot_types_subtitle:
      "From vertigo-inducing viewpoints to epic summits. Explore real spots curated by the community.",
    spot_surf: "Surf",
    spot_beach: "Beaches",
    spot_summit: "Summits",
    spot_viewpoint: "Viewpoints",
    spot_cliff_jumping: "Cliff jumps",
    spot_waterfalls: "Waterfalls",
    spot_lake: "Lakes",
    spot_natural_pools: "Natural Pools",
    spot_caves: "Caves",
    spot_diving: "Diving",
    spot_camping: "Camping",
    spot_adventure: "Adventure",

    preview_label: "How it works",
    preview_title: "Tap a spot. See it exactly as it really is.",
    preview_subtitle:
      "No stock photos. Every spot comes with real videos and photos from people who have been there, its exact location and how to get there.",
    preview_map_title: "Interactive map",
    preview_map_desc:
      "Thousands of spots with filters by type, area search, satellite view and smart clustering.",
    preview_media_title: "Real media",
    preview_media_desc:
      "Photos and videos uploaded by the community. See the exact conditions before you go.",
    preview_routes_title: "Visual routes",
    preview_routes_desc:
      "Multi-day routes with GPX tracks on the map, daily stages and waypoints.",
    preview_tab_for_you: "FOR YOU",
    preview_tab_following: "FOLLOWING",
    preview_view_on_map: "View on map",
    preview_nav_home: "Home",
    preview_nav_explore: "Explore",
    preview_nav_trips: "Trips",
    preview_nav_account: "Account",

    feed_label: "The feed",
    feed_title: "A whole planet of spots to discover",
    feed_subtitle: "Save your favorites, rate the best ones and share your own with the community.",

    spot_one_viewpoint: "Viewpoint",
    spot_one_beach: "Beach",
    spot_one_waterfalls: "Waterfall",
    spot_one_summit: "Summit",
    spot_one_surf: "Surf",
    spot_one_cliff_jumping: "Cliff jump",
    spot_one_lake: "Lake",
    spot_one_natural_pools: "Natural pool",
    spot_one_caves: "Cave",
    spot_one_diving: "Diving",
    spot_one_camping: "Camping",
    spot_one_adventure: "Adventure",

    platforms_label: "Web · iOS · Android",
    platforms_title: "Start on the web. Take it in your pocket.",
    platforms_web_label: "On the web",
    platforms_web_title: "web.outzero.app",
    platforms_web_desc:
      "Open the map instantly in your browser. Nothing to install, shareable URLs and the whole feed one click away.",
    platforms_web_cta: "Open the map →",
    platforms_mobile_label: "On your phone",
    platforms_mobile_title: "iOS and Android",
    platforms_mobile_desc:
      "Download the native app to take your spots with you, with offline maps and on-the-ground navigation thanks to Outzero+.",


    features_label: "All in one app",
    features_title: "Everything you need to explore",
    features_subtitle:
      "Built to help you decide faster: what the spot is like, where it is and how to get there.",
    feature_map_title: "Interactive Map",
    feature_map_desc:
      "Explore thousands of spots on an interactive map with filters by type, area-based search, satellite view and spot clustering. Find your next destination visually.",
    feature_routes_title: "Visual Routes",
    feature_routes_desc:
      "Discover multi-day travel routes organized by country, with GPX tracks rendered on the map, daily itineraries and waypoints for every stop.",
    feature_media_title: "Real Media",
    feature_media_desc:
      "Every spot comes with real photos and videos uploaded by the community — no stock images. See the exact conditions before you go.",
    feature_community_title: "Community Driven",
    feature_community_desc:
      "Upload your own discoveries, rate spots, save favorites and share with the global community of adventurers. Together we map the planet.",
    feature_multiplatform_title: "Works Everywhere",
    feature_multiplatform_desc:
      "Available on iOS, Android and the web — with a responsive desktop layout, shareable URLs and browser history support.",
    feature_plus_title: "Outzero+",
    feature_plus_desc:
      "Go premium for offline maps, satellite view, advanced filters and an ad-free experience. Support the project from \u20AC1.99/month.",
    feature_plus_desc_html:
      "Go premium for offline maps, satellite view, advanced filters and an ad-free experience. Support the project from <strong>\u20AC1.99/month</strong>.",

    about_label: "Our story",
    about_headline_html:
      "We are a community of <em>young, curious travelers with a thirst for adrenaline</em>. We created an app that goes beyond typical travel guides.",
    about_paragraph_1:
      "Vertigo-inducing viewpoints, hidden beaches, remote waterfalls, cliff jumps, hikes only locals know about, magical spots to watch the sunset — all this and much more, with real videos, exact locations and visual routes on the map.",
    about_paragraph_2_html:
      "We started this project because we knew there were <strong>incredible spots that deserved to be discovered</strong>, but were difficult to find. Our mission is to change that.",

    cta_title: "Ready for your next adventure?",
    cta_subtitle:
      "Your next spot is already on the map. Open it right now on the web or take it with you on iOS and Android.",
    cta_button: "Open the map →",
    cta_helper: "No install needed to start on the web.",

    photo_credit_prefix: "Spot",

    footer_open_app: "Open App",
    footer_privacy: "Privacy Policy",
    footer_cookies: "Cookies Policy",
    footer_terms: "Terms of Use",
    footer_copyright: `\u00A9 ${new Date().getFullYear()} Outzero. All rights reserved.`,
  },

  es: {
    meta_title: "Outzero — Descubre Spots Incre\u00EDbles por Todo el Mundo",
    meta_description:
      "Descubre surf, playas escondidas, cascadas, cumbres y otros spots reales de naturaleza con ubicaciones exactas, contexto de ruta y v\u00EDdeos de la comunidad en web, iOS y Android.",

    skip_to_content: "Saltar al contenido",

    nav_spots: "Spots",
    nav_features: "Funciones",
    nav_story: "Historia",

    nav_open_app: "Abrir App",
    nav_menu: "Menú",

    hero_eyebrow: "La comunidad outdoor",
    hero_headline_1: "Descubre spots que no salen",
    hero_headline_2: "en ninguna gu\u00EDa.",
    hero_subheadline:
      "Miradores de esc\u00E1ndalo, playas escondidas, cascadas remotas, cumbres y rincones secretos \u2014 con ubicaci\u00F3n exacta, v\u00EDdeos reales y rutas visuales en el mapa. Todo compartido por una comunidad de aventureros como t\u00FA.",
    hero_cta: "Abrir el mapa \u2192",
    hero_learn_more: "Ver funciones",
    hero_download_ios: "Descargar en App Store",
    hero_download_android: "Disponible en Google Play",
    hero_web_hint: "Abre el mapa en la web en segundos y sigue la aventura en iOS y Android.",
    hero_proof_exact_locations: "Ubicaciones exactas",
    hero_proof_real_videos: "V\u00EDdeos reales",
    hero_proof_visual_routes: "Rutas visuales",
    hero_proof_platforms: "Web, iOS y Android",

    spot_types_label: "Tipos de spot",
    spot_types_title: "Cada tipo de aventura, en un solo mapa",
    spot_types_subtitle:
      "Desde miradores de v\u00E9rtigo hasta cumbres \u00E9picas. Explora spots reales curados por la comunidad.",
    spot_surf: "Surf",
    spot_beach: "Playas",
    spot_summit: "Cumbres",
    spot_viewpoint: "Miradores",
    spot_cliff_jumping: "Saltos",
    spot_waterfalls: "Cascadas",
    spot_lake: "Lagos",
    spot_natural_pools: "Piscinas naturales",
    spot_caves: "Cuevas",
    spot_diving: "Buceo",
    spot_camping: "Camping",
    spot_adventure: "Aventura",

    preview_label: "As\u00ED funciona",
    preview_title: "Toca un spot. M\u00EDralo tal y como es de verdad.",
    preview_subtitle:
      "Nada de fotos de stock. Cada spot llega con v\u00EDdeos y fotos reales de quien ya ha estado all\u00ED, su ubicaci\u00F3n exacta y c\u00F3mo llegar.",
    preview_map_title: "Mapa interactivo",
    preview_map_desc:
      "Miles de spots con filtros por tipo, b\u00FAsqueda por zona, vista sat\u00E9lite y agrupaci\u00F3n inteligente.",
    preview_media_title: "Media real",
    preview_media_desc:
      "Fotos y v\u00EDdeos subidos por la comunidad. Ves las condiciones exactas antes de ir.",
    preview_routes_title: "Rutas visuales",
    preview_routes_desc:
      "Rutas de varios d\u00EDas con tracks GPX en el mapa, etapas diarias y waypoints.",
    preview_tab_for_you: "PARA TI",
    preview_tab_following: "SIGUIENDO",
    preview_view_on_map: "Ver en mapa",
    preview_nav_home: "Inicio",
    preview_nav_explore: "Explorar",
    preview_nav_trips: "Viajes",
    preview_nav_account: "Cuenta",

    feed_label: "El feed",
    feed_title: "Un planeta lleno de spots por descubrir",
    feed_subtitle: "Guarda tus favoritos, valora los mejores y comparte los tuyos con la comunidad.",

    spot_one_viewpoint: "Mirador",
    spot_one_beach: "Playa",
    spot_one_waterfalls: "Cascada",
    spot_one_summit: "Cumbre",
    spot_one_surf: "Surf",
    spot_one_cliff_jumping: "Salto",
    spot_one_lake: "Lago",
    spot_one_natural_pools: "Piscina natural",
    spot_one_caves: "Cueva",
    spot_one_diving: "Buceo",
    spot_one_camping: "Camping",
    spot_one_adventure: "Aventura",

    platforms_label: "Web · iOS · Android",
    platforms_title: "Empieza en la web. Llévatelo en el bolsillo.",
    platforms_web_label: "En la web",
    platforms_web_title: "web.outzero.app",
    platforms_web_desc:
      "Abre el mapa al instante en el navegador. Sin instalar nada, con URLs que puedes compartir y todo el feed a un clic.",
    platforms_web_cta: "Abrir el mapa →",
    platforms_mobile_label: "En tu móvil",
    platforms_mobile_title: "iOS y Android",
    platforms_mobile_desc:
      "Descarga la app nativa para llevarte los spots contigo, con mapas offline y navegación sobre el terreno gracias a Outzero+.",


    features_label: "Todo en una app",
    features_title: "Todo lo que necesitas para explorar",
    features_subtitle:
      "Pensado para decidir m\u00E1s r\u00E1pido: c\u00F3mo es el spot, d\u00F3nde est\u00E1 y c\u00F3mo llegar.",
    feature_map_title: "Mapa interactivo",
    feature_map_desc:
      "Explora miles de spots con filtros por tipo, b\u00FAsqueda por zona, vista sat\u00E9lite y agrupaci\u00F3n. Encuentra tu pr\u00F3ximo destino de forma visual.",
    feature_routes_title: "Rutas visuales",
    feature_routes_desc:
      "Rutas de varios d\u00EDas organizadas por pa\u00EDs, con tracks GPX en el mapa, itinerarios diarios y waypoints para cada parada.",
    feature_media_title: "Media real",
    feature_media_desc:
      "Cada spot viene con fotos y v\u00EDdeos reales subidos por la comunidad \u2014 sin im\u00E1genes de stock. Mira las condiciones exactas antes de ir.",
    feature_community_title: "Impulsado por la comunidad",
    feature_community_desc:
      "Sube tus descubrimientos, valora spots, guarda favoritos y comparte con aventureros de todo el mundo. Juntos mapeamos el planeta.",
    feature_multiplatform_title: "Funciona en todas partes",
    feature_multiplatform_desc:
      "Disponible en iOS, Android y la web \u2014 con dise\u00F1o responsivo de escritorio, URLs compartibles e historial del navegador.",
    feature_plus_title: "Outzero+",
    feature_plus_desc:
      "Pasa a premium para mapas offline, vista sat\u00E9lite, filtros avanzados y una experiencia sin anuncios. Apoya el proyecto desde 1,99\u00A0\u20AC/mes.",
    feature_plus_desc_html:
      "Pasa a premium para mapas offline, vista sat\u00E9lite, filtros avanzados y una experiencia sin anuncios. Apoya el proyecto desde <strong>1,99\u00A0\u20AC/mes</strong>.",

    about_label: "Nuestra historia",
    about_headline_html:
      "Somos una comunidad de <em>viajeros j\u00F3venes, curiosos y con ganas de adrenalina</em>. Creamos una app que va m\u00E1s all\u00E1 de las gu\u00EDas t\u00EDpicas.",
    about_paragraph_1:
      "Miradores de v\u00E9rtigo, playas escondidas, cascadas remotas, saltos de roca, excursiones que solo conocen los locales, spots m\u00E1gicos para ver el atardecer \u2014 todo esto y mucho m\u00E1s, con v\u00EDdeos reales, ubicaci\u00F3n exacta y rutas visuales en el mapa.",
    about_paragraph_2_html:
      "Empezamos este proyecto porque sab\u00EDamos que hab\u00EDa <strong>spots incre\u00EDbles que merec\u00EDan ser descubiertos</strong>, pero eran dif\u00EDciles de encontrar. Nuestra misi\u00F3n es cambiar eso.",

    cta_title: "\u00BFListo para tu pr\u00F3xima aventura?",
    cta_subtitle:
      "Tu pr\u00F3ximo spot ya est\u00E1 en el mapa. \u00C1brelo ahora mismo en la web o ll\u00E9vatelo en iOS y Android.",
    cta_button: "Abrir el mapa \u2192",
    cta_helper: "No necesitas instalar nada para empezar en la web.",

    photo_credit_prefix: "Spot",

    footer_open_app: "Abrir App",
    footer_privacy: "Pol\u00EDtica de Privacidad",
    footer_cookies: "Pol\u00EDtica de Cookies",
    footer_terms: "T\u00E9rminos de Uso",
    footer_copyright: `\u00A9 ${new Date().getFullYear()} Outzero. Todos los derechos reservados.`,
  },
};

/**
 * Get translations for a locale, falling back to English.
 */
export function t(locale: Locale): Translations {
  return translations[locale] ?? translations[defaultLocale];
}

/**
 * Get the alternate locale (for the language switcher).
 */
export function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

/**
 * Get the URL prefix for a locale.
 * English is the default (no prefix), Spanish uses /es/.
 */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}


/**
 * Get the localized home path with a trailing slash.
 */
export function localeHomePath(locale: Locale): string {
  const prefix = localePrefix(locale);
  return prefix ? `${prefix}/` : "/";
}
