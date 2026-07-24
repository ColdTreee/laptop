import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { createPomodoroSession } from '../../../../server/repositories/dashboard-repository'

const sessionSchema = z.object({
  mode: z.enum(['focus', 'short_break']),
  plannedSeconds: z.number().int().min(60).max(10_800),
})

export async function POST(request: Request) {
  const parsed = sessionSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: '番茄钟参数不正确' }, { status: 400 })
  const id = await createPomodoroSession(DEMO_USER_ID, parsed.data.mode, parsed.data.plannedSeconds)
  return NextResponse.json({ id }, { status: 201 })
}
