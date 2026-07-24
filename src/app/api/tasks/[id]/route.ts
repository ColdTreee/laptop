import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { updateTaskCompletion } from '../../../../server/repositories/dashboard-repository'

const taskSchema = z.object({ completed: z.boolean() })

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const taskId = Number(id)
  const parsed = taskSchema.safeParse(await request.json())
  if (!Number.isInteger(taskId) || !parsed.success) {
    return NextResponse.json({ message: '任务参数不正确' }, { status: 400 })
  }
  await updateTaskCompletion(DEMO_USER_ID, taskId, parsed.data.completed)
  return NextResponse.json({ ok: true })
}
