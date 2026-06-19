import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/auth';

// ── POST /api/newsletter — Subscribe ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return apiError('A valid email address is required.', 400);
    }

    await prisma.newsletter.upsert({
      where: { email },
      update: {},
      create: { email }
    });

    return apiResponse({
      message: 'You have been subscribed to exclusive off-market estate alerts!'
    }, 201);
  } catch (err) {
    console.error('[POST /api/newsletter]', err);
    return apiError('Internal server error.', 500);
  }
}
