'use client';

import { useState } from 'react';

import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { GeoTree, ZoneScope, ZoneSelection } from '@/types/db';

export function ZonesPicker({
  geo,
  zones,
  onChange,
}: {
  geo: GeoTree;
  zones: ZoneSelection[];
  onChange: (zones: ZoneSelection[]) => void;
}) {
  const [scope, setScope] = useState<ZoneScope>('quartier');
  const [regionId, setRegionId] = useState<number | null>(null);
  const [departementId, setDepartementId] = useState<number | null>(null);
  const [arrondissementId, setArrondissementId] = useState<number | null>(null);
  const [quartierId, setQuartierId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const region = geo.find((item) => item.id === regionId) ?? null;
  const departement =
    region?.departements.find((item) => item.id === departementId) ?? null;
  const arrondissement =
    departement?.arrondissements.find(
      (item) => item.id === arrondissementId,
    ) ?? null;
  const quartier =
    arrondissement?.quartiers.find((item) => item.id === quartierId) ?? null;

  function reset() {
    setDepartementId(null);
    setArrondissementId(null);
    setQuartierId(null);
  }

  function addZone() {
    setError('');

    if (!regionId) {
      setError('Choisissez au moins une région.');
      return;
    }

    if (scope === 'departement' && !departementId) {
      setError('Choisissez le département.');
      return;
    }

    if (scope === 'arrondissement' && !arrondissementId) {
      setError('Choisissez la commune.');
      return;
    }

    if (scope === 'quartier' && !quartierId) {
      setError('Choisissez le quartier.');
      return;
    }

    const label = [
      region?.nom,
      departement?.nom,
      arrondissement?.nom,
      quartier?.nom,
    ]
      .filter(Boolean)
      .join(' › ');

    const next: ZoneSelection = {
      scope,
      label,
      region_id: scope === 'region' ? regionId ?? undefined : undefined,
      departement_id:
        scope === 'departement' ? departementId ?? undefined : undefined,
      arrondissement_id:
        scope === 'arrondissement'
          ? arrondissementId ?? undefined
          : undefined,
      quartier_id: scope === 'quartier' ? quartierId ?? undefined : undefined,
    };

    const key = `${next.scope}:${next.region_id ?? ''}:${next.departement_id ?? ''}:${next.arrondissement_id ?? ''}:${next.quartier_id ?? ''}`;

    const exists = zones.some((zone) => {
      const zoneKey = `${zone.scope}:${zone.region_id ?? ''}:${zone.departement_id ?? ''}:${zone.arrondissement_id ?? ''}:${zone.quartier_id ?? ''}`;
      return zoneKey === key;
    });

    if (exists) {
      setError('Cette zone est déjà ajoutée.');
      return;
    }

    if (zones.length >= 20) {
      setError('20 zones maximum.');
      return;
    }

    onChange([...zones, next]);
  }

  if (geo.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-muted">
        Les zones ne sont pas encore chargées.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Mes zones d’intervention *</p>
        <p className="text-xs text-muted">
          Ajoutez les quartiers, communes ou régions où vous acceptez des
          demandes. Vous pouvez en ajouter plusieurs.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Type de zone
          </span>
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as ZoneScope);
              reset();
            }}
            className="select-lc"
          >
            <option value="quartier">Quartier</option>
            <option value="arrondissement">Commune / arrondissement</option>
            <option value="departement">Département</option>
            <option value="region">Région entière</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Région
          </span>
          <select
            value={regionId ?? ''}
            onChange={(event) => {
              setRegionId(event.target.value ? Number(event.target.value) : null);
              reset();
            }}
            className="select-lc"
          >
            <option value="">Choisir la région</option>
            {geo.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nom}
              </option>
            ))}
          </select>
        </label>

        {scope !== 'region' ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Département
            </span>
            <select
              value={departementId ?? ''}
              onChange={(event) => {
                setDepartementId(
                  event.target.value ? Number(event.target.value) : null,
                );
                setArrondissementId(null);
                setQuartierId(null);
              }}
              className="select-lc"
              disabled={!region}
            >
              <option value="">Choisir le département</option>
              {(region?.departements ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {scope === 'arrondissement' || scope === 'quartier' ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Commune
            </span>
            <select
              value={arrondissementId ?? ''}
              onChange={(event) => {
                setArrondissementId(
                  event.target.value ? Number(event.target.value) : null,
                );
                setQuartierId(null);
              }}
              className="select-lc"
              disabled={!departement}
            >
              <option value="">Choisir la commune</option>
              {(departement?.arrondissements ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {scope === 'quartier' ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              Quartier
            </span>
            <select
              value={quartierId ?? ''}
              onChange={(event) =>
                setQuartierId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              className="select-lc"
              disabled={!arrondissement}
            >
              <option value="">Choisir le quartier</option>
              {(arrondissement?.quartiers ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addZone}>
          <Icon name="mapPin" size={16} />
          Ajouter cette zone
        </Button>
        <span className="text-xs text-muted">{zones.length}/20</span>
      </div>

      {error ? (
        <p className="text-xs font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}

      {zones.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {zones.map((zone, index) => (
            <Badge
              key={`${zone.scope}-${index}`}
              className="border-line bg-surface2 text-ink"
            >
              {zone.label}
              <button
                type="button"
                onClick={() => onChange(zones.filter((_, i) => i !== index))}
                className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Retirer ${zone.label}`}
              >
                <Icon name="close" size={12} />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
