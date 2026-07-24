import { NextResponse } from 'next/server'
import { z } from 'zod'
import { DEMO_USER_ID } from '../../../../data/server-fallback'
import { updateActivePlan } from '../../../../server/repositories/dashboard-repository'

const planSchema = z.object({
  title: z.string().trim().min(2).max(120),
  dailyMinutes: z.number().int().min(15).max(1440),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  selectedDays: z.array(z.number().int().min(1).max(7)).min(1),
  subjects: z.array(z.string().trim().min(1).max(40)).max(5),
})

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const planId = Number(id)
  const parsed = planSchema.safeParse(await request.json())
  if (!Number.isInteger(planId) || !parsed.success) {
    return NextResponse.json({ message: '计划参数不正确', errors: parsed.error?.flatten() }, { status: 400 })
  }
  await updateActivePlan(DEMO_USER_ID, planId, parsed.data)
  return NextResponse.json({ ok: true })
}
