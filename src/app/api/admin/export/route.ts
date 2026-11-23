import { isAdmin } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ExportRow = {
  id: string;
  token: string;
  categorie: string;
  categorie_nom: string | null;
  probleme: string;
  quartier: string;
  region_nom: string | null;
  is_emergency: boolean;
  tel_client: string;
  statut: string;
  cree_le: string;
  assigne_le: string | null;
  resolue_le: string | null;
  providers: { nom: string } | null;
  ratings: { etoiles: number }[] | null;
};

function cell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('requests')
    .select(
      'id, token, categorie, categorie_nom, probleme, quartier, region_nom, is_emergency, tel_client, statut, cree_le, assigne_le, resolue_le, providers(nom), ratings(etoiles)',
    )
    .order('cree_le', { ascending: false });

  if (error) {
    console.error('[export]', error.message);
    return NextResponse.json(
      { error: 'Export impossible.' },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as unknown as ExportRow[];

  const header = [
    'reference',
    'date',
    'categorie',
    'urgence',
    'probleme',
    'region',
    'quartier',
    'telephone',
    'statut',
    'prestataire',
    'assigne_le',
    'resolue_le',
    'note',
  ];

  const lines = rows.map((row) =>
    [
      row.token.slice(0, 8).toUpperCase(),
      formatDateTime(row.cree_le),
      row.categorie_nom || row.categorie,
      row.is_emergency ? 'OUI' : 'NON',
      row.probleme,
      row.region_nom ?? '',
      row.quartier,
      row.tel_client,
      row.statut,
      row.providers?.nom ?? '',
      formatDateTime(row.assigne_le),
      formatDateTime(row.resolue_le),
      row.ratings?.[0]?.etoiles ?? '',
    ]
      .map(cell)
      .join(';'),
  );

  const csv = `\uFEFF${[header.map(cell).join(';'), ...lines].join('\r\n')}`;

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="life-connect-demandes-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
