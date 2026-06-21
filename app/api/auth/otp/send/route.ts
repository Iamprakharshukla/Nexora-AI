import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { otpStore, apiResponse, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return apiError('Phone number is required.', 400);
    }

    // Look up the user in database by phone number
    const user = await prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return apiError('This mobile number is not registered. Please register first.', 404);
    }

    // Generate a random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in global memory map (expiring in 5 minutes)
    otpStore.set(phone, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    });

    console.log(`[OTP Sent] Phone: ${phone}, Code: ${code}`);

    return apiResponse({
      message: `OTP sent successfully. Code: ${code} (simulated SMS)`,
      code
    });
  } catch (err) {
    console.error('[POST /api/auth/otp/send]', err);
    return apiError('Internal server error.', 500);
  }
}
