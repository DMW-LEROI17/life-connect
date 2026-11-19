import { NextResponse } from 'next/server';

import { getRequestByToken } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  const result = await getRequestByToken(params.token);

  if (!result.ok) {
    const status =
      result.error === 'not_found'
        ? 404
        : result.error === 'not_configured'
          ? 503
          : 500;

    return NextResponse.json(
      { error: result.error },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      statut: result.statut,
      provider: result.provider,
      expire_le: result.expire_le,
      note_donnee: result.note_donnee,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
