'use client';

import { Icon } from '@/components/Icons';
import type { GeoTree, LocationValue } from '@/types/db';

export function LocationPicker({
  geo,
  value,
  onChange,
}: {
  geo: GeoTree;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const region = geo.find((item) => item.id === value.regionId) ?? null;
  const departement =
    region?.departements.find((item) => item.id === value.departementId) ?? null;
  const arrondissement =
    departement?.arrondissements.find(
      (item) => item.id === value.arrondissementId,
    ) ?? null;
  const quartiers = arrondissement?.quartiers ?? [];

  function changeRegion(regionId: number | null) {
    onChange({
      regionId,
      departementId: null,
      arrondissementId: null,
      quartierId: null,
      freeText: value.freeText,
    });
  }

  function changeDepartement(departementId: number | null) {
    onChange({
      ...value,
      departementId,
      arrondissementId: null,
      quartierId: null,
    });
  }

  function changeArrondissement(arrondissementId: number | null) {
    onChange({
      ...value,
      arrondissementId,
      quartierId: null,
    });
  }

  if (geo.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Icon name="mapPin" size={18} />
          Votre zone
        </p>
        <p className="mt-1">
          La liste des régions n’est pas encore chargée. Indiquez votre ville,
          quartier ou un repère connu ci-dessous.
        </p>
        <input
          type="text"
          value={value.freeText}
          onChange={(event) =>
            onChange({ ...value, freeText: event.target.value })
          }
          maxLength={80}
          placeholder="Ex. : Akwa, Douala, près du marché"
          className="input-lc mt-3"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Région *
          </span>
          <select
            value={value.regionId ?? ''}
            onChange={(event) =>
              changeRegion(
                event.target.value ? Number(event.target.value) : null,
              )
            }
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

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Département
          </span>
          <select
            value={value.departementId ?? ''}
            onChange={(event) =>
              changeDepartement(
                event.target.value ? Number(event.target.value) : null,
              )
            }
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

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Commune / arrondissement
          </span>
          <select
            value={value.arrondissementId ?? ''}
            onChange={(event) =>
              changeArrondissement(
                event.target.value ? Number(event.target.value) : null,
              )
            }
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

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">
            Quartier
          </span>
          <select
            value={value.quartierId ?? ''}
            onChange={(event) =>
              onChange({
                ...value,
                quartierId: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
            className="select-lc"
            disabled={!arrondissement || quartiers.length === 0}
          >
            <option value="">Choisir le quartier</option>
            {quartiers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nom}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">
          Autre quartier / village / repère connu
        </span>
        <input
          type="text"
          value={value.freeText}
          onChange={(event) =>
            onChange({ ...value, freeText: event.target.value })
          }
          maxLength={80}
          placeholder="Ex. : derrière la station, village Mbankomo…"
          className="input-lc"
        />
      </label>

      <p className="text-xs text-muted">
        Choisissez la région, puis précisez le quartier ou un repère. Si votre
        quartier n’est pas dans la liste, utilisez le champ libre : c’est
        indispensable hors des grandes villes.
      </p>
    </div>
  );
}
