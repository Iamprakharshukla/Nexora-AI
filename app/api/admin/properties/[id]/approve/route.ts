import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/auth';

// ── PATCH /api/admin/properties/[id]/approve ──────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { approve } = await req.json();

    const property = await prisma.property.update({
      where: { id },
      data: { isApproved: approve !== false }
    });

    return apiResponse({
      message: property.isApproved ? 'Property approved and now live.' : 'Property has been rejected.',
      property
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[PATCH /api/admin/properties/[id]/approve]', err);
    return apiError('Internal server error.', 500);
  }
}
