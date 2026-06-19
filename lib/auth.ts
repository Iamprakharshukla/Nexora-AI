import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nexora-ai-super-secret-jwt-key-2026'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Sign a new JWT token (expires in 7 days)
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify and decode a JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Extract user from Authorization header or cookie
export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  // Try Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return await verifyToken(token);
  }

  // Try cookie
  const cookieToken = req.cookies.get('nexora_token')?.value;
  if (cookieToken) {
    return await verifyToken(cookieToken);
  }

  return null;
}

// Require auth — returns user or throws 401 response
export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized. Please login.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return user;
}

// Require admin role
export async function requireAdmin(req: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new Response(
      JSON.stringify({ error: 'Forbidden. Admin access required.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return user;
}

// Helper to create standard JSON responses
export function apiResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
