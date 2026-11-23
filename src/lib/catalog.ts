import { isSupabaseConfigured } from '@/lib/config';
import { CATEGORIES } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  CategoryRow,
  CategoryWithSubs,
  FamilyRow,
  SubcategoryRow,
} from '@/types/db';

const LEGACY_FAMILIES: FamilyRow[] = [
  {
    slug: 'auto_moto',
    nom_fr: 'Auto & moto',
    nom_en: 'Auto & moto',
    icon: 'wrench',
    description: 'Mécanique, dépannage, transport',
    sort_order: 1,
  },
  {
    slug: 'maison_construction',
    nom_fr: 'Maison & construction',
    nom_en: 'Home & construction',
    icon: 'bolt',
    description: 'Plomberie, électricité, serrurerie, froid',
    sort_order: 2,
  },
  {
    slug: 'numerique_reseau',
    nom_fr: 'Numérique & réseau',
    nom_en: 'Digital & network',
    icon: 'wifi',
    description: 'Wi-Fi, téléphone, ordinateur, TV',
    sort_order: 3,
  },
];

function legacyFamilyFor(slug: string): string {
  if (slug === 'mecanicien') return 'auto_moto';
  if (slug === 'technicien') return 'numerique_reseau';
  return 'maison_construction';
}

export function getLegacyCatalog(): CategoryWithSubs[] {
  return CATEGORIES.map((category, index) => {
    const categoryId = -(index + 1);

    return {
      id: categoryId,
      slug: category.slug,
      family_slug: legacyFamilyFor(category.slug),
      nom_fr: category.label,
      nom_en: null,
      icon: category.icon,
      description: category.description,
      sort_order: index,
      is_active: true,
      is_emergency: false,
      subcategories: category.problems.map((problem, problemIndex) => ({
        id: -(index * 100 + problemIndex + 1),
        category_id: categoryId,
        slug: `legacy_${index}_${problemIndex}`,
        nom_fr: problem,
        nom_en: null,
        description: null,
        sort_order: problemIndex,
        is_active: true,
      })),
    };
  });
}

export function getLegacyFamilies(): FamilyRow[] {
  return LEGACY_FAMILIES;
}

export async function getFamilies(): Promise<FamilyRow[]> {
  if (!isSupabaseConfigured()) return LEGACY_FAMILIES;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('families')
      .select('slug, nom_fr, nom_en, icon, description, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[getFamilies]', error.message);
      return LEGACY_FAMILIES;
    }

    return data && data.length > 0
      ? (data as FamilyRow[])
      : LEGACY_FAMILIES;
  } catch (error) {
    console.error('[getFamilies]', error);
    return LEGACY_FAMILIES;
  }
}

export async function getCatalog(options?: {
  includeInactive?: boolean;
}): Promise<CategoryWithSubs[]> {
  if (!isSupabaseConfigured()) return getLegacyCatalog();

  try {
    const supabase = getSupabaseAdmin();

    let categoriesQuery = supabase
      .from('categories')
      .select('id, slug, family_slug, nom_fr, nom_en, icon, description, sort_order, is_active, is_emergency')
      .order('sort_order', { ascending: true });

    let subcategoriesQuery = supabase
      .from('subcategories')
      .select('id, category_id, slug, nom_fr, nom_en, description, sort_order, is_active')
      .order('sort_order', { ascending: true });

    if (!options?.includeInactive) {
      categoriesQuery = categoriesQuery.eq('is_active', true);
      subcategoriesQuery = subcategoriesQuery.eq('is_active', true);
    }

    const [categoriesResult, subcategoriesResult] = await Promise.all([
      categoriesQuery,
      subcategoriesQuery,
    ]);

    if (categoriesResult.error || subcategoriesResult.error) {
      console.error(
        '[getCatalog]',
        categoriesResult.error?.message || subcategoriesResult.error?.message,
      );
      return getLegacyCatalog();
    }

    const categories = (categoriesResult.data ?? []) as CategoryRow[];
    const subcategories = (subcategoriesResult.data ?? []) as SubcategoryRow[];

    if (categories.length === 0) {
      return getLegacyCatalog();
    }

    const byCategory = new Map<number, SubcategoryRow[]>();
    for (const subcategory of subcategories) {
      const list = byCategory.get(subcategory.category_id) ?? [];
      list.push(subcategory);
      byCategory.set(subcategory.category_id, list);
    }

    return categories.map<CategoryWithSubs>((category) => ({
      ...category,
      subcategories: byCategory.get(category.id) ?? [],
    }));
  } catch (error) {
    console.error('[getCatalog]', error);
    return getLegacyCatalog();
  }
}

export async function getCategoryWithSubs(
  slug: string,
): Promise<CategoryWithSubs | null> {
  const catalog = await getCatalog();
  return catalog.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryLabel(slug: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('categories')
      .select('nom_fr')
      .eq('slug', slug)
      .maybeSingle();

    return (
      (data?.nom_fr as string | undefined) ??
      CATEGORIES.find((category) => category.slug === slug)?.label ??
      slug
    );
  } catch {
    return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
  }
}
