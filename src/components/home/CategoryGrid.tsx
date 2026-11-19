import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { CATEGORIES, CATEGORY_TONE } from '@/lib/constants';

export function CategoryGrid() {
  return (
    <section className="container-lc py-8">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">
          Quel est votre problème ?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Choisissez une catégorie, on s’occupe du reste.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const tone = CATEGORY_TONE[category.slug];

          return (
            <Link
              key={category.slug}
              href={`/aide/${category.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/40 sm:flex-col sm:items-start sm:p-5"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone.iconBox}`}
              >
                <Icon name={category.icon} size={24} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{category.label}</span>
                <span className="block text-sm text-muted">
                  {category.short}
                </span>
                <span className="mt-2 hidden text-xs text-muted sm:block">
                  {category.description}
                </span>
              </span>

              <Icon
                name="chevronRight"
                size={20}
                className="text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
