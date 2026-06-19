import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/auth';

// ── GET /api/localities — Get locality market insights ───────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};
    if (city && city !== 'All') where.city = city;

    const localities = await prisma.locality.findMany({
      where,
      orderBy: { yoyGrowth: 'desc' }
    });

    return apiResponse({ localities });
  } catch (err) {
    console.error('[GET /api/localities]', err);
    return apiError('Internal server error.', 500);
  }
}
