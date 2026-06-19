import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/auth';

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalUsers,
      totalInquiries,
      pendingInquiries,
      totalShortlists,
      totalNewsletterSubs,
      recentInquiries,
      recentUsers
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { isApproved: true } }),
      prisma.property.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.shortlist.count(),
      prisma.newsletter.count(),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { property: { select: { name: true, city: true } } }
      }),
      prisma.user.findMany({
        take: 5,
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, city: true, createdAt: true }
      })
    ]);

    return apiResponse({
      stats: {
        properties: { total: totalProperties, approved: approvedProperties, pending: pendingProperties },
        users: { total: totalUsers },
        inquiries: { total: totalInquiries, pending: pendingInquiries },
        shortlists: { total: totalShortlists },
        newsletter: { total: totalNewsletterSubs }
      },
      recentInquiries,
      recentUsers
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[GET /api/admin/stats]', err);
    return apiError('Internal server error.', 500);
  }
}
