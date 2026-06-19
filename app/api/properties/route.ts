import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAuth, apiResponse, apiError } from '@/lib/auth';

// ── GET /api/properties — List with filters ───────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const purpose   = searchParams.get('purpose');    // BUY | RENT
    const city      = searchParams.get('city');
    const bhk       = searchParams.get('bhk');
    const category  = searchParams.get('category');
    const furnishing = searchParams.get('furnishing');
    const minPrice  = searchParams.get('minPrice');
    const maxPrice  = searchParams.get('maxPrice');
    const sortBy    = searchParams.get('sortBy') || 'createdAt';
    const sortDir   = searchParams.get('sortDir') || 'desc';
    const page      = parseInt(searchParams.get('page') || '1');
    const limit     = parseInt(searchParams.get('limit') || '20');
    const search    = searchParams.get('search');

    const where: Record<string, unknown> = { isApproved: true };

    if (purpose) where.purpose = purpose.toUpperCase();
    if (city)    where.city = { contains: city };
    if (category) where.category = { contains: category };
    if (furnishing) {
      const fm: Record<string, string> = {
        'Furnished': 'FURNISHED',
        'Semi-Furnished': 'SEMI_FURNISHED',
        'Unfurnished': 'UNFURNISHED'
      };
      where.furnishing = fm[furnishing] || furnishing.toUpperCase();
    }
    if (bhk) {
      if (bhk === '6+') {
        where.bhk = { gte: 6 };
      } else {
        where.bhk = parseInt(bhk);
      }
    }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {})
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { locality: { contains: search } },
        { city: { contains: search } },
        { brand: { contains: search } }
      ];
    }

    const validSort = ['price', 'rating', 'createdAt', 'reviewsCount'];
    const orderBy: Record<string, string> = {};
    orderBy[validSort.includes(sortBy) ? sortBy : 'createdAt'] = sortDir === 'asc' ? 'asc' : 'desc';

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, price: true, brand: true, description: true,
          category: true, rating: true, reviewsCount: true, carpetArea: true,
          carpetAreaSqFt: true, facing: true, completionStatus: true, reraId: true,
          purpose: true, bhk: true, locality: true, city: true, furnishing: true,
          floor: true, totalFloors: true, parking: true, amenities: true,
          pricePerSqFt: true, possessionDate: true, constructionAge: true,
          images: true, isFeatured: true, createdAt: true
        }
      }),
      prisma.property.count({ where })
    ]);

    // Parse JSON fields
    const parsed = properties.map(p => ({
      ...p,
      amenities: JSON.parse(p.amenities || '[]'),
      images: JSON.parse(p.images || '[]')
    }));

    return apiResponse({
      properties: parsed,
      pagination: {
        page, limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total
      }
    });
  } catch (err) {
    console.error('[GET /api/properties]', err);
    return apiError('Internal server error.', 500);
  }
}

// ── POST /api/properties — Create new listing (auth required) ─────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const {
      name, price, brand, description, category, purpose, bhk, locality, city,
      furnishing, floor, totalFloors, parking, amenities, pricePerSqFt,
      possessionDate, constructionAge, images, carpetArea, carpetAreaSqFt,
      facing, completionStatus, reraId
    } = body;

    if (!name || !price || !description || !city || !purpose) {
      return apiError('Name, price, description, city and purpose are required.', 400);
    }

    const furnishingMap: Record<string, 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'> = {
      'Furnished': 'FURNISHED',
      'Semi-Furnished': 'SEMI_FURNISHED',
      'Unfurnished': 'UNFURNISHED'
    };

    const property = await prisma.property.create({
      data: {
        name,
        price: parseFloat(price),
        brand: brand || city,
        description,
        category: category || 'Apartment',
        purpose: (purpose || 'BUY').toUpperCase() as 'BUY' | 'RENT' | 'SELL',
        bhk: bhk ? parseInt(bhk) : undefined,
        locality,
        city,
        furnishing: furnishing ? furnishingMap[furnishing] : undefined,
        floor: floor ? parseInt(floor) : undefined,
        totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
        parking: parking ? parseInt(parking) : undefined,
        amenities: JSON.stringify(amenities || []),
        pricePerSqFt: pricePerSqFt ? parseFloat(pricePerSqFt) : undefined,
        possessionDate,
        constructionAge,
        images: JSON.stringify(images || []),
        carpetArea,
        carpetAreaSqFt: carpetAreaSqFt ? parseFloat(carpetAreaSqFt) : undefined,
        facing,
        completionStatus,
        reraId,
        isApproved: false, // Pending admin approval
        postedById: user.userId
      }
    });

    return apiResponse({
      message: 'Property submitted for review. Our team will verify and approve within 24 hours.',
      propertyId: property.id
    }, 201);
  } catch (err) {
    console.error('[POST /api/properties]', err);
    return apiError('Internal server error.', 500);
  }
}
