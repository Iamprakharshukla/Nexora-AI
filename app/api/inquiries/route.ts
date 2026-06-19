import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAdmin, apiResponse, apiError } from '@/lib/auth';

// ── POST /api/inquiries — Submit inquiry / site visit ────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { name, phone, email, message, type, propertyId } = await req.json();

    if (!name || !phone || !propertyId) {
      return apiError('Name, phone and propertyId are required.', 400);
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return apiError('Property not found.', 404);
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        phone,
        email,
        message,
        type: (['SITE_VISIT', 'CALL_BACK', 'GENERAL'].includes(type) ? type : 'SITE_VISIT'),
        propertyId,
        userId: user?.userId
      }
    });

    return apiResponse({
      message: 'Your inquiry has been submitted! Our advisor will contact you within 2 hours.',
      inquiryId: inquiry.id
    }, 201);
  } catch (err) {
    console.error('[POST /api/inquiries]', err);
    return apiError('Internal server error.', 500);
  }
}

// ── GET /api/inquiries — Admin: get all inquiries ─────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page   = parseInt(searchParams.get('page') || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase();

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: { select: { id: true, name: true, city: true, price: true } },
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.inquiry.count({ where })
    ]);

    return apiResponse({
      inquiries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[GET /api/inquiries]', err);
    return apiError('Internal server error.', 500);
  }
}
