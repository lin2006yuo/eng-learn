import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { studyPlans } from '@/lib/db/patterns-schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();

  const plans = await db
    .select()
    .from(studyPlans)
    .orderBy(asc(studyPlans.dayNumber));

  const dayMap = new Map<number, number>();
  plans.forEach((plan) => {
    dayMap.set(plan.dayNumber, (dayMap.get(plan.dayNumber) ?? 0) + 1);
  });

  const days = Array.from(dayMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayNumber, patternCount]) => ({ dayNumber, patternCount }));

  return NextResponse.json({ days });
}
