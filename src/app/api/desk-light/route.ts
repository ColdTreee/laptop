import { NextResponse } from 'next/server'
import { DEMO_USER_ID } from '../../../data/server-fallback'
import { getLatestEnvironmentReading } from '../../../server/repositories/dashboard-repository'

export async function GET(request: Request) {
  const userId = Number(new URL(request.url).searchParams.get('userId') ?? DEMO_USER_ID)
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'userId must be a positive integer' }, { status: 400 })
  }

  const reading = await getLatestEnvironmentReading(userId)
  return NextResponse.json({
    deskLampBrightnessPercent: reading.deskLampBrightnessPercent,
    colorTemperatureKelvin: reading.colorTemperatureKelvin,
  })
}
