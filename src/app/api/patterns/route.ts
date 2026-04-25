import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { patterns, examples, studyPlans, comments, commentLikes, commentAnchors } from '@/lib/db/patterns-schema';
import { users } from '@/lib/db/schema';
import { eq, and, inArray, desc, sql, count, isNull } from 'drizzle-orm';

/**
 * GET /api/patterns
 *
 * Query modes (mutually exclusive):
 * - `?id=<patternId>`   单个句型 + 例句
 * - `?day=<number>`     指定学习计划天数的句型 + 例句 + 热门评论摘要
 * - `?search=<query>`   按关键词搜索 (title / translation / 例句)
 * - (无参数)            返回全部句型 + 例句
 */
export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const patternId = searchParams.get('id');
  const search = searchParams.get('search');
  const day = searchParams.get('day');

  if (patternId) {
    const [pattern] = await db
      .select()
      .from(patterns)
      .where(eq(patterns.id, patternId))
      .limit(1);

    if (!pattern) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
    }

    const patternExamples = await db
      .select()
      .from(examples)
      .where(eq(examples.patternId, patternId));

    return NextResponse.json({
      ...pattern,
      examples: patternExamples,
    });
  }

  if (day) {
    const dayNumber = parseInt(day, 10);
    const plansForDay = await db
      .select()
      .from(studyPlans)
      .where(eq(studyPlans.dayNumber, dayNumber));

    if (plansForDay.length === 0) {
      return NextResponse.json([]);
    }

    const patternIds = plansForDay.map((p) => p.patternId);
    const dayPatterns = await db
      .select()
      .from(patterns)
      .where(inArray(patterns.id, patternIds));

    const allExamples = await db
      .select()
      .from(examples)
      .where(inArray(examples.patternId, patternIds));

    const topCommentsRows = await db
      .select({
        targetId: comments.targetId,
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        createdAt: comments.createdAt,
        likesCount: sql<number>`COUNT(${commentLikes.id})`,
        nickname: users.nickname,
        userName: users.name,
      })
      .from(comments)
      .leftJoin(commentLikes, eq(commentLikes.commentId, comments.id))
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(commentAnchors, eq(commentAnchors.commentId, comments.id))
      .where(and(
        eq(comments.targetType, 'pattern'),
        inArray(comments.targetId, patternIds),
        eq(comments.rootType, 'pattern'),
        eq(comments.rootId, comments.targetId),
        isNull(commentAnchors.commentId),
      ))
      .groupBy(comments.id, users.nickname, users.name)
      .orderBy(desc(sql`COUNT(${commentLikes.id})`))
      .limit(100);

    const totalCommentCounts = await db
      .select({
        targetId: comments.targetId,
        count: count(),
      })
      .from(comments)
      .leftJoin(commentAnchors, eq(commentAnchors.commentId, comments.id))
      .where(and(
        eq(comments.targetType, 'pattern'),
        inArray(comments.targetId, patternIds),
        isNull(commentAnchors.commentId),
      ))
      .groupBy(comments.targetId);

    const totalCommentsByPattern = new Map<string, number>();
    totalCommentCounts.forEach(row => {
      totalCommentsByPattern.set(row.targetId, row.count);
    });

    const topCommentsByPattern = new Map<string, any[]>();
    topCommentsRows.forEach(row => {
      const arr = topCommentsByPattern.get(row.targetId) || [];
      if (arr.length < 2) {
        arr.push({
          id: row.id,
          content: row.content,
          userId: row.userId,
          createdAt: row.createdAt?.toISOString(),
          likes: row.likesCount,
          nickname: row.nickname || row.userName || 'Unknown',
        });
      }
      topCommentsByPattern.set(row.targetId, arr);
    });

    const result = dayPatterns.map((pattern) => ({
      ...pattern,
      examples: allExamples.filter((ex) => ex.patternId === pattern.id),
      commentSummary: {
        totalCount: totalCommentsByPattern.get(pattern.id) || 0,
        topComments: topCommentsByPattern.get(pattern.id) || [],
      },
    }));

    result.sort((a, b) => {
      const numA = parseInt(a.id.replace('pattern-', ''), 10);
      const numB = parseInt(b.id.replace('pattern-', ''), 10);
      return numA - numB;
    });

    return NextResponse.json(result);
  }

  const allPatterns = await db.select().from(patterns);
  const allExamples = await db.select().from(examples);

  const groupedPatterns = allPatterns.map((pattern) => ({
    ...pattern,
    examples: allExamples.filter((ex) => ex.patternId === pattern.id),
  }));

  groupedPatterns.sort((a, b) => {
    const numA = parseInt(a.id.replace('pattern-', ''), 10);
    const numB = parseInt(b.id.replace('pattern-', ''), 10);
    return numA - numB;
  });

  if (search) {
    const query = search.toLowerCase();
    const filtered = groupedPatterns.filter((pattern) => {
      const titleMatch = pattern.title.toLowerCase().includes(query) ||
        pattern.translation.includes(search);
      const exampleMatch = pattern.examples.some(
        (ex) => ex.en.toLowerCase().includes(query) || ex.zh.includes(search)
      );
      return titleMatch || exampleMatch;
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(groupedPatterns);
}
