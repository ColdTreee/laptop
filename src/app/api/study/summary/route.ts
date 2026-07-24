import { NextResponse } from 'next/server'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { parseDashboardRange } from '../../../../lib/range'
import { getStudySummary } from '../../../../server/repositories/dashboard-repository'

export async function GET(request: Request) {
  const range = parseDashboardRange(new URL(request.url).searchParams.get('range') ?? undefined)
  return NextResponse.json(await getStudySummary(DEMO_USER_ID, range))
}
