import { NextResponse } from 'next/server';

import { resolveUniversalSearch } from '@/lib/universal-search';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const target = q ? resolveUniversalSearch(q).href : '/';

  return NextResponse.redirect(new URL(target, url.origin));
}
