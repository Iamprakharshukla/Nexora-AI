import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAdmin, apiResponse, apiError } from '@/lib/auth';

// ── GET /api/properties/[id] ──────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: { id: true, name: true, email: true, phone: true }
        },
        _count: { select: { shortlists: true, inquiries: true } }
      }
    });

    if (!property) {
      return apiError('Property not found.', 404);
    }

    return apiResponse({
      property: {
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]')
      }
    });
  } catch (err) {
    console.error('[GET /api/properties/[id]]', err);
    return apiError('Internal server error.', 500);
  }
}

// ── PUT /api/properties/[id] — Admin update ───────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        images: body.images ? JSON.stringify(body.images) : undefined
      }
    });

    return apiResponse({
      property: {
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]')
      }
    });
  } catch (err) {
    console.error('[PUT /api/properties/[id]]', err);
    return apiError('Internal server error.', 500);
  }
}

// ── DELETE /api/properties/[id] — Admin or Owner ──────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return apiError('Unauthorized.', 401);
    }
    const { id } = await params;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return apiError('Property not found.', 404);
    }

    if (user.role !== 'ADMIN' && property.postedById !== user.userId) {
      return apiError('Forbidden.', 403);
    }

    await prisma.property.delete({ where: { id } });
    return apiResponse({ message: 'Property deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/properties/[id]]', err);
    return apiError('Internal server error.', 500);
  }
}
