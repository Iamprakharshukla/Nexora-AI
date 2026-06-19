import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/auth';

// ── GET /api/admin/properties — All properties incl. pending ─────────────────
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const approved = searchParams.get('approved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (approved === 'true') where.isApproved = true;
    if (approved === 'false') where.isApproved = false;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          postedBy: { select: { id: true, name: true, email: true } },
          _count: { select: { shortlists: true, inquiries: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.property.count({ where })
    ]);

    const parsed = properties.map(p => ({
      ...p,
      amenities: JSON.parse(p.amenities || '[]'),
      images: JSON.parse(p.images || '[]')
    }));

    return apiResponse({
      properties: parsed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[GET /api/admin/properties]', err);
    return apiError('Internal server error.', 500);
  }
}
