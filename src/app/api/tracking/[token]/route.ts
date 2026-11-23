import { NextResponse } from 'next/server';

import { getRequestTracking } from '@/lib/tracking';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  const tracking = await getRequestTracking(params.token);

  if (!tracking.ok) {
    return NextResponse.json(tracking, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return NextResponse.json(tracking, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
