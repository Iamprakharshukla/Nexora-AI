import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { otpStore, signToken, apiResponse, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return apiError('Phone number and verification code are required.', 400);
    }

    const cached = otpStore.get(phone);

    if (!cached) {
      return apiError('No verification code requested for this number.', 400);
    }

    if (cached.expires < Date.now()) {
      otpStore.delete(phone);
      return apiError('Verification code has expired. Please request a new one.', 400);
    }

    if (cached.code !== code) {
      return apiError('Invalid verification code.', 400);
    }

    // Code matches and is valid, delete from map
    otpStore.delete(phone);

    // Load the user from database
    const user = await prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return apiError('User not found.', 404);
    }

    // Sign JWT token
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      phone: user.phone,
      budget: user.budget,
      createdAt: user.createdAt
    };

    return apiResponse({ user: safeUser, token });
  } catch (err) {
    console.error('[POST /api/auth/otp/verify]', err);
    return apiError('Internal server error.', 500);
  }
}
