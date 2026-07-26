import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { isDatabaseConfigured } from '../../../../lib/db'
import {
  createEnvironmentReadings,
  getLatestEnvironmentReading,
} from '../../../../server/repositories/dashboard-repository'

const readingSchema = z.object({
  postureStatus: z.int().min(0).max(4).optional(),
  seatStatus: z.int().min(0).max(1).optional(),
  ambientLightLux: z.int().min(0).optional(),
  deskLampBrightnessPercent: z.int().min(0).max(100).optional(),
  colorTemperatureKelvin: z.int().min(1000).max(10000).optional(),
  deskLampMode: z.enum(['auto', 'manual']).optional(),
  writingDistanceCm: z.int().min(0).optional(),
  studyDurationMinutes: z.int().min(0).optional(),
  capturedAt: z.iso.datetime().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: 'At least one measurement field is required',
})

const userIdSchema = z.int().positive().optional()

const queryReadingSchema = z.object({
  postureStatus: z.coerce.number().int().min(0).max(4).optional(),
  seatStatus: z.coerce.number().int().min(0).max(1).optional(),
  ambientLightLux: z.coerce.number().int().min(0).optional(),
  deskLampBrightnessPercent: z.coerce.number().int().min(0).max(100).optional(),
  colorTemperatureKelvin: z.coerce.number().int().min(1000).max(10000).optional(),
  deskLampMode: z.enum(['auto', 'manual']).optional(),
  writingDistanceCm: z.coerce.number().int().min(0).optional(),
  studyDurationMinutes: z.coerce.number().int().min(0).optional(),
  capturedAt: z.iso.datetime().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: 'At least one measurement field is required',
})

const queryReadingFields = [
  ['postureStatus', 'posture_status'],
  ['seatStatus', 'seat_status'],
  ['ambientLightLux', 'ambient_light_lux'],
  ['deskLampBrightnessPercent', 'desk_lamp_brightness_percent'],
  ['colorTemperatureKelvin', 'color_temperature_kelvin'],
  ['deskLampMode', 'desk_lamp_mode'],
  ['writingDistanceCm', 'writing_distance_cm'],
  ['studyDurationMinutes', 'study_duration_minutes'],
  ['capturedAt', 'captured_at'],
] as const

function readQueryReading(params: URLSearchParams) {
  const reading = Object.fromEntries(queryReadingFields.flatMap(([key, legacyKey]) => {
    const value = params.get(key) ?? params.get(legacyKey)
    return value === null ? [] : [[key, value]]
  }))
  return queryReadingSchema.safeParse(reading)
}

function hasQueryReading(params: URLSearchParams) {
  return queryReadingFields.some(([key, legacyKey]) => params.has(key) || params.has(legacyKey))
}

export async function GET(request: Request) {
  const userId = Number(new URL(request.url).searchParams.get('userId') ?? DEMO_USER_ID)
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'userId must be a positive integer' }, { status: 400 })
  }
  return NextResponse.json(await getLatestEnvironmentReading(userId))
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const params = new URL(request.url).searchParams
  if (hasQueryReading(params)) {
    const userId = Number(params.get('userId') ?? params.get('user_id') ?? DEMO_USER_ID)
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'userId or user_id must be a positive integer' }, { status: 400 })
    }

    const parsedReading = readQueryReading(params)
    if (!parsedReading.success) {
      return NextResponse.json({ error: 'Invalid measurement fields', details: parsedReading.error.flatten() }, { status: 400 })
    }

    const ids = await createEnvironmentReadings(userId, [parsedReading.data])
    return NextResponse.json({ count: ids.length, ids }, { status: 201 })
  }

  const raw: unknown = await request.json().catch(() => null)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const payload = raw as Record<string, unknown>
  const parsedUserId = userIdSchema.safeParse(payload.userId)
  if (!parsedUserId.success) {
    return NextResponse.json({ error: 'userId must be a positive integer' }, { status: 400 })
  }

  const candidates = payload.records === undefined
    ? [Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'userId'))]
    : Array.isArray(payload.records) ? payload.records : null
  if (!candidates || candidates.length === 0 || candidates.length > 100) {
    return NextResponse.json({ error: 'records must contain between 1 and 100 items' }, { status: 400 })
  }

  const parsedReadings = z.array(readingSchema).safeParse(candidates)
  if (!parsedReadings.success) {
    return NextResponse.json({ error: 'Invalid measurement fields', details: parsedReadings.error.flatten() }, { status: 400 })
  }

  const ids = await createEnvironmentReadings(parsedUserId.data ?? DEMO_USER_ID, parsedReadings.data)
  return NextResponse.json({ count: ids.length, ids }, { status: 201 })
}
