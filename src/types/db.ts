export type Categorie = 'mecanicien' | 'depanneur' | 'technicien';

export type RequestStatus =
  | 'nouvelle'
  | 'en_recherche'
  | 'assignee'
  | 'resolue'
  | 'annulee'
  | 'expiree';

export type ProviderStatus = 'en_attente' | 'valide' | 'refuse' | 'suspendu';

export type IconName =
  | 'wrench'
  | 'bolt'
  | 'wifi'
  | 'mapPin'
  | 'phone'
  | 'star'
  | 'shield'
  | 'clock'
  | 'check'
  | 'close'
  | 'chevronRight'
  | 'arrowLeft'
  | 'whatsapp'
  | 'sun'
  | 'moon'
  | 'alert'
  | 'search'
  | 'user'
  | 'camera'
  | 'logout'
  | 'download'
  | 'send'
  | 'spark';

export interface CategoryDef {
  slug: Categorie;
  label: string;
  short: string;
  description: string;
  icon: IconName;
  accent: 'urgent' | 'teal' | 'violet';
  problems: readonly string[];
}

export interface PublicProvider {
  nom: string;
  metier: Categorie;
  specialite: string | null;
  photo_url: string | null;
  note_moyenne: number;
  nombre_avis: number;
  quartier: string;
  whatsapp: string;
  distance_km: number | null;
}

export interface RequestPublic {
  ok: true;
  token: string;
  ville: string;
  categorie: Categorie;
  probleme: string;
  description: string | null;
  quartier: string;
  statut: RequestStatus;
  cree_le: string;
  expire_le: string;
  assigne_le: string | null;
  note_donnee: boolean;
  provider: PublicProvider | null;
}

export interface RequestError {
  ok: false;
  error: string;
}

export type RequestLookup = RequestPublic | RequestError;

export interface ProviderRow {
  id: string;
  nom: string;
  metier: Categorie;
  specialite: string | null;
  quartier: string;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
  photo_url: string | null;
  statut: ProviderStatus;
  disponible: boolean;
  note_moyenne: number;
  nombre_avis: number;
  est_demo: boolean;
  cree_le: string;
  valide_le: string | null;
}

export interface RatingRow {
  etoiles: number;
  resolu: boolean;
  commentaire: string | null;
  cree_le: string;
}

export interface RequestListRow {
  id: string;
  token: string;
  categorie: Categorie;
  probleme: string;
  quartier: string;
  tel_client: string;
  statut: RequestStatus;
  cree_le: string;
  assigne_le: string | null;
  providers: { nom: string } | null;
}

export interface RequestDetailRow {
  id: string;
  token: string;
  ville: string;
  categorie: Categorie;
  probleme: string;
  description: string | null;
  tel_client: string;
  latitude: number | null;
  longitude: number | null;
  quartier: string;
  statut: RequestStatus;
  provider_id: string | null;
  cree_le: string;
  expire_le: string;
  assigne_le: string | null;
  resolue_le: string | null;
  annulee_le: string | null;
  note_donnee: boolean;
  est_demo: boolean;
  providers: ProviderRow | null;
  ratings: RatingRow[];
}

export interface NearbyProvider {
  id: string;
  nom: string;
  metier: Categorie;
  specialite: string | null;
  quartier: string;
  distance_km: number | null;
  note_moyenne: number;
  nombre_avis: number;
  photo_url: string | null;
  whatsapp: string;
  disponible: boolean;
}

export interface AdminStats {
  total_30j: number;
  aujourdhui: number;
  en_attente: number;
  temps_reponse_moyen_sec: number | null;
  pourcentage_resolu: number;
  note_moyenne: number | null;
}
