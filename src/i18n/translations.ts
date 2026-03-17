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

  // Navbar
  nav_open_app: string;

  // Hero
  hero_headline_1: string;
  hero_headline_2: string;
  hero_subheadline: string;
  hero_cta: string;
  hero_learn_more: string;

  // Spot Types
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
  spot_adventure: string;

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

  // About
  about_label: string;
  about_headline: string;
  about_paragraph_1: string;
  about_paragraph_2: string;

  // CTA
  cta_title: string;
  cta_subtitle: string;
  cta_button: string;

  // Footer
  footer_open_app: string;
  footer_privacy: string;
  footer_terms: string;
  footer_copyright: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    meta_title: "Outzero — Discover Amazing Spots Around the World",
    meta_description:
      "Outzero is a community of adventurers discovering, sharing and saving the best outdoor spots on the planet. Surf, beaches, waterfalls, summits and more.",

    nav_open_app: "Open App",

    hero_headline_1: "Discover amazing spots",
    hero_headline_2: "around the world",
    hero_subheadline:
      "A community of adventurers sharing the best surf breaks, hidden beaches, epic waterfalls, summits and secret spots — with real videos, exact locations and visual routes on the map.",
    hero_cta: "Open App",
    hero_learn_more: "Learn more",

    spot_types_title: "Every type of adventure",
    spot_types_subtitle:
      "From surfing on deserted beaches to epic mountain summits — explore outdoor spots curated by the community.",
    spot_surf: "Surf",
    spot_beach: "Beaches",
    spot_summit: "Summits",
    spot_viewpoint: "Viewpoints",
    spot_cliff_jumping: "Cliff Jumping",
    spot_waterfalls: "Waterfalls",
    spot_lake: "Lakes",
    spot_natural_pools: "Natural Pools",
    spot_caves: "Caves",
    spot_diving: "Diving",
    spot_adventure: "Adventure",

    features_label: "Features",
    features_title: "Everything you need to explore",
    features_subtitle:
      "Built for adventurers, by adventurers. Every feature is designed to help you discover your next destination.",
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

    about_label: "Our story",
    about_headline:
      "We are a community of young, curious travelers with a thirst for adrenaline. We created an app that goes beyond typical travel guides.",
    about_paragraph_1:
      "Surfing on deserted beaches, impressive cliff jumps, remote waterfalls, excursions only locals know about, magical spots to watch the sunset — all this and much more, with real videos, exact locations and visual routes on the map.",
    about_paragraph_2:
      "We started this project because we knew there were incredible spots that deserved to be discovered, but were difficult to find. Our mission is to change that.",

    cta_title: "Ready for your next adventure?",
    cta_subtitle:
      "OUTZERO is more than an app — it\u2019s a community of adventurers. Join us and be part of something bigger. Together, we can discover, protect and share the best spots on the planet.",
    cta_button: "Open App",

    footer_open_app: "Open App",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
    footer_copyright: `\u00A9 ${new Date().getFullYear()} Outzero. All rights reserved.`,
  },

  es: {
    meta_title: "Outzero — Descubre Spots Incre\u00EDbles por Todo el Mundo",
    meta_description:
      "Outzero es una comunidad de aventureros que descubren, comparten y guardan los mejores spots de naturaleza del planeta. Surf, playas, cascadas, cumbres y mucho m\u00E1s.",

    nav_open_app: "Abrir App",

    hero_headline_1: "Descubre spots incre\u00EDbles",
    hero_headline_2: "por todo el mundo",
    hero_subheadline:
      "Una comunidad de aventureros compartiendo los mejores breaks de surf, playas escondidas, cascadas \u00E9picas, cumbres y spots secretos \u2014 con v\u00EDdeos reales, ubicaciones exactas y rutas visuales en el mapa.",
    hero_cta: "Abrir App",
    hero_learn_more: "Saber m\u00E1s",

    spot_types_title: "Cada tipo de aventura",
    spot_types_subtitle:
      "Desde surf en playas desiertas hasta cumbres de monta\u00F1a \u00E9picas \u2014 explora spots de naturaleza curados por la comunidad.",
    spot_surf: "Surf",
    spot_beach: "Playas",
    spot_summit: "Cumbres",
    spot_viewpoint: "Miradores",
    spot_cliff_jumping: "Salto de Acantilado",
    spot_waterfalls: "Cascadas",
    spot_lake: "Lagos",
    spot_natural_pools: "Piscinas Naturales",
    spot_caves: "Cuevas",
    spot_diving: "Buceo",
    spot_adventure: "Aventura",

    features_label: "Caracter\u00EDsticas",
    features_title: "Todo lo que necesitas para explorar",
    features_subtitle:
      "Hecho por aventureros, para aventureros. Cada funci\u00F3n est\u00E1 dise\u00F1ada para ayudarte a descubrir tu pr\u00F3ximo destino.",
    feature_map_title: "Mapa Interactivo",
    feature_map_desc:
      "Explora miles de spots en un mapa interactivo con filtros por tipo, b\u00FAsqueda por zona, vista sat\u00E9lite y agrupaci\u00F3n de spots. Encuentra tu pr\u00F3ximo destino visualmente.",
    feature_routes_title: "Rutas Visuales",
    feature_routes_desc:
      "Descubre rutas de viaje de varios d\u00EDas organizadas por pa\u00EDs, con tracks GPX renderizados en el mapa, itinerarios diarios y waypoints para cada parada.",
    feature_media_title: "Media Real",
    feature_media_desc:
      "Cada spot viene con fotos y v\u00EDdeos reales subidos por la comunidad \u2014 sin im\u00E1genes de stock. Mira las condiciones exactas antes de ir.",
    feature_community_title: "Impulsado por la Comunidad",
    feature_community_desc:
      "Sube tus propios descubrimientos, valora spots, guarda favoritos y comparte con la comunidad global de aventureros. Juntos mapeamos el planeta.",
    feature_multiplatform_title: "Funciona en Todas Partes",
    feature_multiplatform_desc:
      "Disponible en iOS, Android y la web \u2014 con un dise\u00F1o responsivo de escritorio, URLs compartibles y soporte de historial del navegador.",
    feature_plus_title: "Outzero+",
    feature_plus_desc:
      "Pasa a premium para mapas offline, vista sat\u00E9lite, filtros avanzados y una experiencia sin anuncios. Apoya el proyecto desde 1,99\u00A0\u20AC/mes.",

    about_label: "Nuestra historia",
    about_headline:
      "Somos una comunidad de viajeros j\u00F3venes, curiosos y con ganas de adrenalina. Creamos una app que va m\u00E1s all\u00E1 de las gu\u00EDas t\u00EDpicas.",
    about_paragraph_1:
      "Surf en playas desiertas, saltos de roca impresionantes, cascadas remotas, excursiones que solo conocen los locales, spots m\u00E1gicos para ver el atardecer \u2014 todo esto y mucho m\u00E1s, con v\u00EDdeos reales, ubicaci\u00F3n exacta y rutas visuales en el mapa.",
    about_paragraph_2:
      "Comenzamos este proyecto porque sab\u00EDamos que hab\u00EDa spots incre\u00EDbles que merec\u00EDan ser descubiertos, pero eran dif\u00EDciles de encontrar. Nuestra misi\u00F3n es cambiar eso.",

    cta_title: "\u00BFPreparado para tu pr\u00F3xima aventura?",
    cta_subtitle:
      "OUTZERO es m\u00E1s que una app \u2014 es una comunidad de aventureros. \u00DAnete a nosotros y forma parte de algo m\u00E1s grande. Juntos, podemos descubrir, proteger y compartir los mejores spots del planeta.",
    cta_button: "Abrir App",

    footer_open_app: "Abrir App",
    footer_privacy: "Pol\u00EDtica de Privacidad",
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
