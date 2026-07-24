import { NextResponse } from 'next/server'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { getActivePlan } from '../../../../server/repositories/dashboard-repository'

export async function GET() {
  return NextResponse.json(await getActivePlan(DEMO_USER_ID))
}
