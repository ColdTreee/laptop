import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DEMO_USER_ID } from '../../../../../data/server-fallback'
import { finishPomodoroSession } from '../../../../../server/repositories/dashboard-repository'

const finishSchema = z.object({
  elapsedSeconds: z.number().int().min(0).max(10_800),
  completed: z.boolean(),
})

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const sessionId = Number(id)
  const parsed = finishSchema.safeParse(await request.json())
  if (!Number.isInteger(sessionId) || !parsed.success) {
    return NextResponse.json({ message: '番茄钟状态参数不正确' }, { status: 400 })
  }
  await finishPomodoroSession(DEMO_USER_ID, sessionId, parsed.data.elapsedSeconds, parsed.data.completed)
  return NextResponse.json({ ok: true })
}
