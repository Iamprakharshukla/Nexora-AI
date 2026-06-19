import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, apiResponse, apiError } from '@/lib/auth';

// ── DELETE /api/shortlist/[id] — Remove from shortlist ───────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    // id can be shortlistId or propertyId
    const record = await prisma.shortlist.findFirst({
      where: {
        userId: user.userId,
        OR: [{ id }, { propertyId: id }]
      }
    });

    if (!record) {
      return apiError('Shortlist entry not found.', 404);
    }

    await prisma.shortlist.delete({ where: { id: record.id } });

    return apiResponse({ message: 'Removed from shortlist.' });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[DELETE /api/shortlist/[id]]', err);
    return apiError('Internal server error.', 500);
  }
}
