import type { CategoryWithSubs, GeoTree } from '@/types/db';

export interface NeedExtraction {
  categorySlugs: string[];
  regionId: number | null;
  regionSlug: string | null;
  keywords: string[];
  source: 'regles' | 'ia';
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const STOPWORDS = new Set([
  'je',
  'j',
  'ai',
  'un',
  'une',
  'des',
  'le',
  'la',
  'les',
  'de',
  'du',
  'pour',
  'avec',
  'dans',
  'sur',
  'a',
  'au',
  'aux',
  'et',
  'ou',
  'mon',
  'ma',
  'mes',
  'cherche',
  'besoin',
  'voudrais',
  'peux',
  'qui',
  'que',
  'est',
  'sont',
  'en',
  'il',
  'elle',
  'nous',
  'vous',
  'me',
  'moi',
  'svp',
  'merci',
]);

function keywordsFrom(query: string): string[] {
  return Array.from(
    new Set(
      normalize(query)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !STOPWORDS.has(word)),
    ),
  ).slice(0, 8);
}

function deterministicExtraction(
  query: string,
  catalog: CategoryWithSubs[],
  geo: GeoTree,
): NeedExtraction {
  const text = normalize(query);
  const keywords = keywordsFrom(query);

  const categorySlugs: string[] = [];

  for (const category of catalog) {
    const categoryName = normalize(category.nom_fr);
    const categorySlug = category.slug.replace(/_/g, ' ');

    if (
      text.includes(categoryName) ||
      text.includes(categorySlug) ||
      category.subcategories.some((sub) => text.includes(normalize(sub.nom_fr)))
    ) {
      categorySlugs.push(category.slug);
    }
  }

  let regionId: number | null = null;
  let regionSlug: string | null = null;

  for (const region of geo) {
    const names = [
      region.nom,
      ...region.departements.map((departement) => departement.nom),
      ...region.departements.flatMap((departement) =>
        departement.arrondissements.map((arrondissement) => arrondissement.nom),
      ),
    ];

    if (names.some((name) => text.includes(normalize(name)))) {
      regionId = region.id;
      regionSlug = region.slug;
      break;
    }
  }

  return {
    categorySlugs: Array.from(new Set(categorySlugs)),
    regionId,
    regionSlug,
    keywords,
    source: 'regles',
  };
}

/**
 * LIFE AI : extraction d'intention.
 * - Par défaut : règles locales déterministes (aucune invention).
 * - Si LIFE_AI_API_URL et LIFE_AI_API_KEY sont définis, un modèle
 *   compatible OpenAI est appelé, puis les résultats sont validés contre
 *   le catalogue réel. En cas d'échec, on retombe sur les règles.
 */
export async function extractNeed(
  query: string,
  catalog: CategoryWithSubs[],
  geo: GeoTree,
): Promise<NeedExtraction> {
  const fallback = deterministicExtraction(query, catalog, geo);

  const apiUrl = process.env.LIFE_AI_API_URL;
  const apiKey = process.env.LIFE_AI_API_KEY;

  if (!apiUrl || !apiKey) return fallback;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.LIFE_AI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Tu extrais un besoin. Réponds uniquement en JSON avec category_slugs (tableau), region_slug (chaîne ou null), keywords (tableau). Utilise uniquement les slugs fournis. N’invente rien.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              query,
              categories: catalog.map((category) => ({
                slug: category.slug,
                nom: category.nom_fr,
                services: category.subcategories.map((sub) => sub.nom_fr),
              })),
              regions: geo.map((region) => ({
                slug: region.slug,
                nom: region.nom,
              })),
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return fallback;

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallback;

    const parsed = JSON.parse(content) as {
      category_slugs?: string[];
      region_slug?: string | null;
      keywords?: string[];
    };

    const validSlugs = new Set(catalog.map((category) => category.slug));
    const categorySlugs = (parsed.category_slugs ?? []).filter((slug) =>
      validSlugs.has(slug),
    );
    const region = geo.find((item) => item.slug === parsed.region_slug);

    const keywords = (parsed.keywords ?? [])
      .filter((word) => typeof word === 'string' && word.length >= 2)
      .slice(0, 8);

    return {
      categorySlugs:
        categorySlugs.length > 0 ? categorySlugs : fallback.categorySlugs,
      regionId: region?.id ?? fallback.regionId,
      regionSlug: region?.slug ?? fallback.regionSlug,
      keywords: keywords.length > 0 ? keywords : fallback.keywords,
      source: 'ia',
    };
  } catch {
    return fallback;
  }
}
