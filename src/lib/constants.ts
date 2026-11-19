import type { CategoryDef, Categorie, ProviderStatus, RequestStatus } from '@/types/db';

export const CATEGORY_SLUGS = ['mecanicien', 'depanneur', 'technicien'] as const;

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'mecanicien',
    label: 'Mécanicien',
    short: 'Voiture et moto',
    description: 'Panne, pneu, batterie, moteur : un mécanicien près de vous.',
    icon: 'wrench',
    accent: 'urgent',
    problems: [
      'La voiture ne démarre pas',
      'Pneu crevé',
      'Surchauffe moteur',
      'Batterie à plat',
      'Autre problème mécanique',
    ],
  },
  {
    slug: 'depanneur',
    label: 'Dépanneur',
    short: 'Maison et plomberie',
    description: "Électricité, eau, serrure, froid : un dépanneur intervient chez vous.",
    icon: 'bolt',
    accent: 'teal',
    problems: [
      "Panne d'électricité",
      "Fuite d'eau / plomberie",
      'Porte bloquée / serrure',
      'Frigo ou climatisation',
      'Autre dépannage',
    ],
  },
  {
    slug: 'technicien',
    label: 'Technicien',
    short: 'Numérique et réseau',
    description: 'Wi-Fi, téléphone, ordinateur, TV : un technicien vous dépanne.',
    icon: 'wifi',
    accent: 'violet',
    problems: [
      'Wi-Fi / internet coupé',
      'Téléphone cassé',
      "Ordinateur ne s'allume plus",
      'Installation TV / décodeur',
      'Autre problème technique',
    ],
  },
];

export const QUARTIERS = [
  'Akwa',
  'Bonanjo',
  'Bonapriso',
  'Deïdo',
  'Bépanda',
  'Makepe',
  'Ndokoti',
  'Ndogbong',
  'Kotto',
  'Bonabéri',
  'Logbessou',
  'PK8',
  'PK14',
  'Yassa',
  'Japoma',
  'Cité des Palmiers',
  'New Bell',
  'Bassa',
  'Dikolo',
  'Nylon',
] as const;

export const STATUS_LABELS: Record<RequestStatus, string> = {
  nouvelle: 'Nouvelle',
  en_recherche: 'En recherche',
  assignee: 'Assignée',
  resolue: 'Résolue',
  annulee: 'Annulée',
  expiree: 'Expirée',
};

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  refuse: 'Refusé',
  suspendu: 'Suspendu',
};

export const STATUS_BADGE_CLASSES: Record<RequestStatus, string> = {
  nouvelle: 'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10',
  en_recherche: 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  assignee: 'border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
  resolue: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  annulee: 'border-line bg-surface2 text-muted',
  expiree: 'border-slate-500/30 bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
};

export const PROVIDER_STATUS_BADGE_CLASSES: Record<ProviderStatus, string> = {
  en_attente: 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  valide: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  refuse: 'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10',
  suspendu: 'border-line bg-surface2 text-muted',
};

export const CATEGORY_TONE: Record<
  Categorie,
  { iconBox: string; badge: string }
> = {
  mecanicien: {
    iconBox: 'bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10 dark:text-urgent-400',
    badge: 'bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10 dark:text-urgent-400',
  },
  depanneur: {
    iconBox: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    badge: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
  },
  technicien: {
    iconBox: 'bg-violet-500/10 text-violet-500',
    badge: 'bg-violet-500/10 text-violet-500',
  },
};

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function isCategorie(value: string): value is Categorie {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '237672115570';
