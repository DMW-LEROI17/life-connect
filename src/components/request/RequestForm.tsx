'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createRequest } from '@/actions/create-request';
import { LocationPicker } from '@/components/geo/LocationPicker';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type {
  CategoryWithSubs,
  GeoTree,
  LocationValue,
} from '@/types/db';

const EMPTY_LOCATION: LocationValue = {
  regionId: null,
  departementId: null,
  arrondissementId: null,
  quartierId: null,
  freeText: '',
};

export function RequestForm({
  category,
  geo,
}: {
  category: CategoryWithSubs;
  geo: GeoTree;
}) {
  const router = useRouter();

  const [nom, setNom] = useState('');
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [customProblem, setCustomProblem] = useState('');
  const [description, setDescription] = useState('');
  const [tel, setTel] = useState('');
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    'idle',
  );
  const [geoMessage, setGeoMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [siteWeb, setSiteWeb] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedSubcategory =
    category.subcategories.find((item) => item.id === subcategoryId) ?? null;

  function locate() {
    setGeoState('loading');
    setGeoMessage('');

    if (!('geolocation' in navigator)) {
      setGeoState('error');
      setGeoMessage('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
        setGeoState('ok');
        setGeoMessage('Position ajoutée. Elle aide à trouver les pros proches.');
      },
      () => {
        setGeoState('error');
        setGeoMessage(
          'Position indisponible. Pas de problème : votre zone suffit.',
        );
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const problem = selectedSubcategory?.nom_fr || customProblem.trim();

    if (nom.trim().length < 2) {
      setError('Entrez votre nom complet.');
      return;
    }

    if (!problem || problem.length < 2) {
      setError('Choisissez votre problème ou décrivez-le en quelques mots.');
      return;
    }

    if (
      (problem.startsWith('Autre') || category.slug === 'autre_besoin') &&
      description.trim().length < 10
    ) {
      setError(
        'Décrivez votre besoin en quelques mots (10 caractères minimum).',
      );
      return;
    }

    if (!tel.trim()) {
      setError('Entrez votre numéro de téléphone.');
      return;
    }

    if (geo.length > 0 && !location.regionId) {
      setError('Choisissez votre région.');
      return;
    }

    if (!location.quartierId && location.freeText.trim().length < 2) {
      setError('Indiquez votre quartier, votre village ou un repère connu.');
      return;
    }

    if (!consent) {
      setError('Vous devez accepter d’être contacté au sujet de cette demande.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set('categorie', category.slug);
    formData.set('nom_client', nom.trim());
    formData.set(
      'sous_categorie_id',
      selectedSubcategory ? String(selectedSubcategory.id) : '',
    );
    formData.set('probleme', problem);
    formData.set('description', description);
    formData.set('tel_client', tel);
    formData.set('region_id', location.regionId ? String(location.regionId) : '');
    formData.set(
      'departement_id',
      location.departementId ? String(location.departementId) : '',
    );
    formData.set(
      'arrondissement_id',
      location.arrondissementId ? String(location.arrondissementId) : '',
    );
    formData.set(
      'quartier_id',
      location.quartierId ? String(location.quartierId) : '',
    );
    formData.set('quartier', location.freeText);
    formData.set('site_web', siteWeb);
    formData.set('consent', consent ? 'on' : '');

    if (position) {
      formData.set('latitude', String(position.lat));
      formData.set('longitude', String(position.lng));
    }

    const result = await createRequest(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem('lc_requests') || '[]',
      ) as string[];
      localStorage.setItem(
        'lc_requests',
        JSON.stringify([result.token, ...saved].slice(0, 10)),
      );
    } catch {
      // Le suivi reste accessible par le lien affiché après l'envoi.
    }

    router.push(`/suivi/${result.token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Field
        label="Votre nom complet"
        htmlFor="nom_client"
        hint="L’administrateur et le prestataire verront ce nom."
        required
      >
        <input
          id="nom_client"
          name="nom_client"
          type="text"
          value={nom}
          onChange={(event) => setNom(event.target.value)}
          maxLength={80}
          autoComplete="name"
          className="input-lc"
          placeholder="Ex. : Jean Mbarga"
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-semibold">Votre problème</legend>
        <p className="mt-1 text-sm text-muted">
          Choisissez ce qui correspond le mieux à votre situation.
        </p>

        <div className="mt-3 grid gap-2">
          {category.subcategories.map((subcategory) => {
            const selected = subcategoryId === subcategory.id;
            return (
              <label
                key={subcategory.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  selected
                    ? 'border-urgent-500 bg-urgent-50 dark:bg-urgent-500/10'
                    : 'border-line bg-surface hover:bg-surface2'
                }`}
              >
                <input
                  type="radio"
                  name="probleme"
                  checked={selected}
                  onChange={() => setSubcategoryId(subcategory.id)}
                  className="h-5 w-5 accent-urgent-500"
                />
                <span className="text-sm font-medium">{subcategory.nom_fr}</span>
              </label>
            );
          })}

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
              subcategoryId === 0
                ? 'border-urgent-500 bg-urgent-50 dark:bg-urgent-500/10'
                : 'border-line bg-surface hover:bg-surface2'
            }`}
          >
            <input
              type="radio"
              name="probleme"
              checked={subcategoryId === 0}
              onChange={() => setSubcategoryId(0)}
              className="h-5 w-5 accent-urgent-500"
            />
            <span className="text-sm font-medium">
              Autre / je ne sais pas
            </span>
          </label>
        </div>

        {subcategoryId === 0 || category.subcategories.length === 0 ? (
          <input
            type="text"
            value={customProblem}
            onChange={(event) => setCustomProblem(event.target.value)}
            maxLength={160}
            placeholder="Décrivez votre problème en quelques mots"
            className="input-lc mt-2"
          />
        ) : null}
      </fieldset>

      <Field
        label="Précisions"
        htmlFor="description"
        hint="Facultatif, sauf pour « Autre ». 600 caractères maximum."
      >
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={600}
          rows={3}
          className="textarea-lc"
          placeholder="Ex. : le pneu arrière est crevé devant la station."
        />
        <p className="mt-1 text-right text-xs text-muted">
          {description.length}/600
        </p>
      </Field>

      <Field
        label="Votre numéro"
        htmlFor="tel"
        hint="Il sert uniquement au prestataire assigné et à l’administrateur."
        required
      >
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:ring-2 focus-within:ring-teal-500/30">
          <span className="flex items-center border-r border-line px-3 text-sm font-semibold text-muted">
            +237
          </span>
          <input
            id="tel"
            name="tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={tel}
            onChange={(event) => setTel(event.target.value)}
            placeholder="6 72 11 55 70"
            className="h-12 w-full bg-transparent px-3 text-base outline-none placeholder:text-muted"
          />
        </div>
      </Field>

      <div>
        <p className="text-sm font-semibold">Où êtes-vous ? *</p>
        <p className="mb-3 mt-1 text-sm text-muted">
          Région, commune puis quartier. Le champ libre est là pour les villages
          et les zones non listées.
        </p>
        <LocationPicker geo={geo} value={location} onChange={setLocation} />
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Position précise</p>
            <p className="text-xs text-muted">
              Facultative. Elle aide à calculer la distance des prestataires.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={locate}
            disabled={geoState === 'loading'}
          >
            {geoState === 'loading' ? (
              <Spinner />
            ) : (
              <Icon name="mapPin" size={18} />
            )}
            {position ? 'Position ajoutée' : 'Utiliser ma position'}
          </Button>
        </div>

        {geoMessage ? (
          <p
            className={`mt-2 text-xs ${
              geoState === 'error'
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-teal-600 dark:text-teal-400'
            }`}
            role="status"
          >
            {geoMessage}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-teal-500"
        />
        <span>
          J’accepte d’être contacté au sujet de cette demande. Voir la{' '}
          <a
            href="/legal/confidentialite"
            className="font-semibold underline underline-offset-2"
          >
            politique de confidentialité
          </a>
          .
        </span>
      </label>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="site_web">Site web</label>
        <input
          id="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={siteWeb}
          onChange={(event) => setSiteWeb(event.target.value)}
        />
      </div>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner /> Envoi…
          </>
        ) : (
          <>
            <Icon name="search" size={20} /> TROUVER UN PRESTATAIRE
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted">
        En envoyant, vous acceptez les{' '}
        <a href="/legal/conditions" className="underline underline-offset-2">
          conditions d’utilisation
        </a>
        .
      </p>
    </form>
  );
}
