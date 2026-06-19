import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, apiResponse, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const jwtUser = await getUserFromRequest(req);
    if (!jwtUser) {
      return apiError('Unauthorized.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        phone: true,
        budget: true,
        createdAt: true,
        _count: {
          select: { shortlists: true, inquiries: true, properties: true }
        }
      }
    });

    if (!user) {
      return apiError('User not found.', 404);
    }

    return apiResponse({ user });
  } catch (err) {
    console.error('[me]', err);
    return apiError('Internal server error.', 500);
  }
}
