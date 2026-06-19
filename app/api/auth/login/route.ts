import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, apiResponse, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError('Email and password are required.', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError('Invalid email or password.', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return apiError('Invalid email or password.', 401);
    }

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
    console.error('[login]', err);
    return apiError('Internal server error.', 500);
  }
}
