import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, apiResponse, apiError } from '@/lib/auth';

// ── GET /api/shortlist — Get user's shortlisted properties ───────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const shortlists = await prisma.shortlist.findMany({
      where: { userId: user.userId },
      include: {
        property: {
          select: {
            id: true, name: true, price: true, brand: true, description: true,
            category: true, rating: true, carpetArea: true, facing: true,
            completionStatus: true, reraId: true, purpose: true, bhk: true,
            locality: true, city: true, furnishing: true, floor: true,
            totalFloors: true, pricePerSqFt: true, images: true, amenities: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const properties = shortlists.map(s => ({
      shortlistId: s.id,
      addedAt: s.createdAt,
      ...s.property,
      images: JSON.parse(s.property.images || '[]'),
      amenities: JSON.parse(s.property.amenities || '[]')
    }));

    return apiResponse({ properties, count: properties.length });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[GET /api/shortlist]', err);
    return apiError('Internal server error.', 500);
  }
}

// ── POST /api/shortlist — Add to shortlist ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { propertyId } = await req.json();

    if (!propertyId) {
      return apiError('propertyId is required.', 400);
    }

    // Check property exists
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return apiError('Property not found.', 404);
    }

    const shortlist = await prisma.shortlist.upsert({
      where: { userId_propertyId: { userId: user.userId, propertyId } },
      update: {},
      create: { userId: user.userId, propertyId }
    });

    return apiResponse({ message: 'Property added to shortlist.', shortlistId: shortlist.id }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[POST /api/shortlist]', err);
    return apiError('Internal server error.', 500);
  }
}
