'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import {
  createCategory,
  createSubcategory,
  toggleCategory,
  toggleSubcategory,
  updateCategory,
} from '@/actions/admin';
import { Icon, safeIcon } from '@/components/Icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type {
  CategoryWithSubs,
  FamilyRow,
} from '@/types/db';

const ICONS = [
  'wrench',
  'bolt',
  'wifi',
  'alert',
  'user',
  'spark',
  'star',
  'shield',
  'send',
  'search',
];

export function CategoryManager({
  families,
  catalog,
}: {
  families: FamilyRow[];
  catalog: CategoryWithSubs[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function run(
    key: string,
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setBusy(key);
    setError('');

    const result = await action();

    if (!result.ok) {
      setError(result.error ?? 'Une erreur est survenue.');
      setBusy(null);
      return false;
    }

    router.refresh();
    setBusy(null);
    return true;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const success = await run('create', () =>
      createCategory({
        family_slug: String(data.get('family_slug') ?? ''),
        slug: String(data.get('slug') ?? ''),
        nom_fr: String(data.get('nom_fr') ?? ''),
        nom_en: String(data.get('nom_en') ?? ''),
        icon: String(data.get('icon') ?? 'wrench'),
        description: String(data.get('description') ?? ''),
        sort_order: Number(data.get('sort_order') ?? 99),
        is_emergency: data.get('is_emergency') === 'on',
      }),
    );

    if (success) form.reset();
  }

  return (
    <div className="mt-5 space-y-5">
      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold">Ajouter une catégorie</h2>
        <p className="mt-1 text-xs text-muted">
          Une catégorie apparaît sur la page d’accueil et dans la recherche. Le
          slug doit être unique (a-z, 0-9, _).
        </p>

        <form onSubmit={handleCreate} className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Famille
            </span>
            <select name="family_slug" required className="select-lc">
              {families.map((family) => (
                <option key={family.slug} value={family.slug}>
                  {family.nom_fr}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Slug
            </span>
            <input
              name="slug"
              required
              pattern="[a-z0-9_]{2,60}"
              placeholder="ex. plombier"
              className="input-lc"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Nom français
            </span>
            <input name="nom_fr" required maxLength={80} className="input-lc" />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Nom anglais (facultatif)
            </span>
            <input name="nom_en" maxLength={80} className="input-lc" />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Icône
            </span>
            <select name="icon" className="select-lc">
              {ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Ordre d’affichage
            </span>
            <input
              name="sort_order"
              type="number"
              defaultValue={99}
              min={0}
              max={999}
              className="input-lc"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Description
            </span>
            <input name="description" maxLength={200} className="input-lc" />
          </label>

          <label className="flex items-center gap-2 text-xs sm:col-span-2">
            <input
              name="is_emergency"
              type="checkbox"
              className="h-4 w-4 accent-urgent-500"
            />
            Catégorie d’urgence (badge rouge)
          </label>

          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={busy === 'create'}>
              {busy === 'create' ? <Spinner /> : <Icon name="check" size={16} />}
              Créer la catégorie
            </Button>
          </div>
        </form>
      </section>

      {families.map((family) => {
        const categories = catalog.filter(
          (category) => category.family_slug === family.slug,
        );

        return (
          <section key={family.slug}>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name={safeIcon(family.icon)} size={16} />
              </span>
              <h2 className="text-sm font-bold">{family.nom_fr}</h2>
              <span className="text-xs text-muted">
                {categories.length} catégorie
                {categories.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-2 space-y-2">
              {categories.map((category) => {
                const categoryKey = `cat-${category.id}`;

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-line bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface2 text-muted">
                          <Icon name={safeIcon(category.icon)} size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {category.nom_fr}
                            {category.is_emergency ? (
                              <Badge className="ml-2 border-urgent-500/30 bg-urgent-50 text-urgent-600">
                                URGENCE
                              </Badge>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-muted">
                            {category.slug} · {category.subcategories.length}{' '}
                            sous-service
                            {category.subcategories.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={
                            category.is_active
                              ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : 'border-line bg-surface2 text-muted'
                          }
                        >
                          {category.is_active ? 'Active' : 'Désactivée'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            run(`${categoryKey}-toggle`, () =>
                              toggleCategory(category.id, !category.is_active),
                            )
                          }
                          disabled={busy === `${categoryKey}-toggle`}
                        >
                          {busy === `${categoryKey}-toggle` ? (
                            <Spinner />
                          ) : null}
                          {category.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-muted">
                        Modifier / ajouter un sous-service
                      </summary>

                      <form
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const form = event.currentTarget;
                          const data = new FormData(form);
                          const success = await run(`${categoryKey}-edit`, () =>
                            updateCategory(category.id, {
                              nom_fr: String(data.get('nom_fr') ?? ''),
                              nom_en: String(data.get('nom_en') ?? ''),
                              icon: String(data.get('icon') ?? 'wrench'),
                              description: String(
                                data.get('description') ?? '',
                              ),
                              sort_order: Number(
                                data.get('sort_order') ?? 99,
                              ),
                              is_emergency:
                                data.get('is_emergency') === 'on',
                            }),
                          );
                          if (success) form.reset();
                        }}
                        className="mt-2 grid gap-2 rounded-xl bg-surface2 p-3 sm:grid-cols-2"
                      >
                        <input
                          name="nom_fr"
                          defaultValue={category.nom_fr}
                          maxLength={80}
                          className="input-lc"
                          aria-label="Nom français"
                        />
                        <input
                          name="nom_en"
                          defaultValue={category.nom_en ?? ''}
                          maxLength={80}
                          className="input-lc"
                          aria-label="Nom anglais"
                        />
                        <select
                          name="icon"
                          defaultValue={category.icon}
                          className="select-lc"
                          aria-label="Icône"
                        >
                          {ICONS.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </select>
                        <input
                          name="sort_order"
                          type="number"
                          defaultValue={category.sort_order}
                          className="input-lc"
                          aria-label="Ordre"
                        />
                        <input
                          name="description"
                          defaultValue={category.description ?? ''}
                          maxLength={200}
                          className="input-lc sm:col-span-2"
                          aria-label="Description"
                        />
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            name="is_emergency"
                            type="checkbox"
                            defaultChecked={category.is_emergency}
                            className="h-4 w-4 accent-urgent-500"
                          />
                          Urgence
                        </label>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={busy === `${categoryKey}-edit`}
                        >
                          Enregistrer
                        </Button>
                      </form>

                      <div className="mt-3 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs"
                          >
                            <span>
                              {subcategory.nom_fr}
                              <span className="ml-1 text-[10px] text-muted">
                                ({subcategory.slug})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                run(`sub-${subcategory.id}`, () =>
                                  toggleSubcategory(
                                    subcategory.id,
                                    !subcategory.is_active,
                                  ),
                                )
                              }
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                subcategory.is_active
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                  : 'bg-surface2 text-muted'
                              }`}
                              disabled={busy === `sub-${subcategory.id}`}
                            >
                              {subcategory.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        ))}

                        <form
                          onSubmit={async (event) => {
                            event.preventDefault();
                            const form = event.currentTarget;
                            const data = new FormData(form);
                            const success = await run(
                              `${categoryKey}-sub`,
                              () =>
                                createSubcategory({
                                  category_id: category.id,
                                  slug: String(data.get('slug') ?? ''),
                                  nom_fr: String(data.get('nom_fr') ?? ''),
                                  sort_order: Number(
                                    data.get('sort_order') ?? 99,
                                  ),
                                }),
                            );
                            if (success) form.reset();
                          }}
                          className="mt-2 flex flex-wrap gap-1.5"
                        >
                          <input
                            name="nom_fr"
                            required
                            placeholder="Nouveau sous-service"
                            maxLength={100}
                            className="input-lc h-9 flex-1 text-xs"
                          />
                          <input
                            name="slug"
                            required
                            pattern="[a-z0-9_]{2,60}"
                            placeholder="slug"
                            className="input-lc h-9 w-28 text-xs"
                          />
                          <input
                            name="sort_order"
                            type="number"
                            defaultValue={99}
                            className="input-lc h-9 w-16 text-xs"
                            aria-label="Ordre"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={busy === `${categoryKey}-sub`}
                          >
                            Ajouter
                          </Button>
                        </form>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
