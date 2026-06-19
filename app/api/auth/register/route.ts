import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, apiResponse, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, city } = await req.json();

    if (!name || !email || !password) {
      return apiError('Name, email and password are required.', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters.', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('An account with this email already exists.', 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, city, role: 'USER' },
      select: { id: true, name: true, email: true, role: true, city: true, phone: true, createdAt: true }
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    return apiResponse({ user, token }, 201);
  } catch (err) {
    console.error('[register]', err);
    return apiError('Internal server error.', 500);
  }
}
