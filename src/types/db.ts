export type Categorie = string;

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
  metier_nom?: string | null;
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
  categorie_nom?: string | null;
  probleme: string;
  description: string | null;
  quartier: string;
  region_nom?: string | null;
  departement_nom?: string | null;
  arrondissement_nom?: string | null;
  statut: RequestStatus;
  is_emergency?: boolean;
  emergency_type?: string | null;
  needs_transport?: boolean;
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
  metier_nom: string | null;
  specialite: string | null;
  quartier: string;
  quartier_id: number | null;
  region_id: number | null;
  departement_id: number | null;
  arrondissement_id: number | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
  photo_url: string | null;
  statut: ProviderStatus;
  disponible: boolean;
  note_moyenne: number;
  nombre_avis: number;
  est_demo: boolean;
  type_aideur: boolean;
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
  categorie_nom: string | null;
  probleme: string;
  quartier: string;
  region_nom: string | null;
  tel_client: string;
  statut: RequestStatus;
  is_emergency: boolean;
  cree_le: string;
  assigne_le: string | null;
  providers: { nom: string } | null;
}

export interface RequestDetailRow {
  id: string;
  token: string;
  ville: string;
  categorie: Categorie;
  categorie_nom: string | null;
  probleme: string;
  description: string | null;
  tel_client: string;
  latitude: number | null;
  longitude: number | null;
  quartier: string;
  quartier_id: number | null;
  region_id: number | null;
  departement_id: number | null;
  arrondissement_id: number | null;
  sous_categorie_id: number | null;
  region_nom: string | null;
  departement_nom: string | null;
  arrondissement_nom: string | null;
  statut: RequestStatus;
  provider_id: string | null;
  is_emergency: boolean;
  emergency_type: string | null;
  needs_transport: boolean;
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
  metier_nom: string | null;
  specialite: string | null;
  quartier: string;
  quartier_id: number | null;
  zone_score: number;
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

export interface AdminRegionStats {
  region_nom: string;
  total: number;
  en_attente: number;
  resolues: number;
  urgentes: number;
}

// -----------------------------------------------------------------------------
// V2 — géographie, catalogue, urgences
// -----------------------------------------------------------------------------
export interface QuartierNode {
  id: number;
  nom: string;
}

export interface ArrondissementNode {
  id: number;
  nom: string;
  quartiers: QuartierNode[];
}

export interface DepartementNode {
  id: number;
  nom: string;
  arrondissements: ArrondissementNode[];
}

export interface RegionNode {
  id: number;
  nom: string;
  slug: string;
  departements: DepartementNode[];
}

export type GeoTree = RegionNode[];

export interface RegionRow {
  id: number;
  slug: string;
  nom: string;
  chef_lieu: string | null;
}

export interface FamilyRow {
  slug: string;
  nom_fr: string;
  nom_en: string | null;
  icon: string;
  description: string | null;
  sort_order: number;
}

export interface CategoryRow {
  id: number;
  slug: string;
  family_slug: string;
  nom_fr: string;
  nom_en: string | null;
  icon: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  is_emergency: boolean;
}

export interface SubcategoryRow {
  id: number;
  category_id: number;
  slug: string;
  nom_fr: string;
  nom_en: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryWithSubs extends CategoryRow {
  subcategories: SubcategoryRow[];
}

export interface EmergencyGuide {
  slug: string;
  title: string;
  summary: string | null;
  icon: string;
  do_steps: string[];
  dont_steps: string[];
  warning: string;
  sort_order: number;
}

export interface EmergencyFacility {
  id: number;
  nom: string;
  type: 'hopital' | 'clinique' | 'centre_sante' | 'pharmacie' | 'ambulance' | 'protection_civile';
  region_id: number | null;
  region_nom: string | null;
  departement_nom: string | null;
  ville: string;
  adresse: string | null;
  telephone: string | null;
  telephone_alt: string | null;
  latitude: number | null;
  longitude: number | null;
  horaires: string | null;
  is_verified: boolean;
  source: string | null;
}

export type ZoneScope =
  | 'region'
  | 'departement'
  | 'arrondissement'
  | 'quartier';

export interface ZoneSelection {
  scope: ZoneScope;
  region_id?: number;
  departement_id?: number;
  arrondissement_id?: number;
  quartier_id?: number;
  label: string;
}

export interface LocationValue {
  regionId: number | null;
  departementId: number | null;
  arrondissementId: number | null;
  quartierId: number | null;
  freeText: string;
}

// -----------------------------------------------------------------------------
// V3 — comptes, profils, LIFE CONNECT / REQUEST
// -----------------------------------------------------------------------------
export type UserRole =
  | 'particulier'
  | 'professionnel'
  | 'commercant'
  | 'entreprise'
  | 'moderateur'
  | 'admin';

export interface ProfileRow {
  id: string;
  full_name: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export type PostKind = 'besoin' | 'offre';
export type PostStatus = 'ouverte' | 'en_cours' | 'close' | 'expiree';

export interface PostRow {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string | null;
  kind: PostKind;
  title: string;
  description: string;
  category_id: number | null;
  region_id: number | null;
  city: string | null;
  quartier: string | null;
  budget: string | null;
  deadline: string | null;
  status: PostStatus;
  visibility: 'publique' | 'membres';
  created_at: string;
  categories: { nom_fr: string } | null;
}

export interface ProposalRow {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  message: string;
  price: string | null;
  status: 'envoyee' | 'acceptee' | 'refusee' | 'retiree';
  created_at: string;
}
