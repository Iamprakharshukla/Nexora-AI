import { productsDb, localitiesDb } from '../types/properties';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Nexora AI database...');

  // ── 1. Seed Admin User ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('nexora@admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexora.ai' },
    update: {},
    create: {
      name: 'Nexora Admin',
      email: 'admin@nexora.ai',
      password: adminPassword,
      role: 'ADMIN',
      city: 'Mumbai',
      phone: '+91 98765 00001'
    }
  });
  console.log('✅ Admin user seeded:', admin.email);

  // ── 2. Seed Test User ───────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('user@123', 10);
  await prisma.user.upsert({
    where: { email: 'test@nexora.ai' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'test@nexora.ai',
      password: userPassword,
      role: 'USER',
      city: 'Mumbai',
      phone: '+91 98765 43210',
      budget: '₹5 Cr - ₹15 Cr'
    }
  });
  console.log('✅ Test user seeded: test@nexora.ai / user@123');

  // ── 3. Seed Properties ──────────────────────────────────────────────────────
  for (const p of productsDb) {
    const furnishingMap: Record<string, 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'> = {
      'Furnished': 'FURNISHED',
      'Semi-Furnished': 'SEMI_FURNISHED',
      'Unfurnished': 'UNFURNISHED'
    };
    const purposeMap: Record<string, 'BUY' | 'RENT' | 'SELL'> = {
      'BUY': 'BUY',
      'RENT': 'RENT',
      'SELL': 'SELL'
    };

    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        description: p.description,
        category: p.category,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        carpetArea: p.carpetArea,
        carpetAreaSqFt: p.carpetAreaSqFt,
        facing: p.facing,
        completionStatus: p.completionStatus,
        reraId: p.reraId,
        purpose: purposeMap[p.purpose || 'BUY'] || 'BUY',
        bhk: p.bhk,
        locality: p.locality,
        city: p.city,
        furnishing: p.furnishing ? furnishingMap[p.furnishing] : undefined,
        floor: p.floor,
        totalFloors: p.totalFloors,
        parking: p.parking,
        amenities: JSON.stringify(p.amenities || []),
        pricePerSqFt: p.pricePerSqFt,
        possessionDate: p.possessionDate,
        constructionAge: p.constructionAge,
        images: JSON.stringify(p.images || []),
        isApproved: true,
        isFeatured: ['prod-1', 'prod-2', 'prod-9', 'prod-10'].includes(p.id),
        postedById: admin.id
      }
    });
  }
  console.log(`✅ ${productsDb.length} properties seeded`);

  // ── 4. Seed Localities ──────────────────────────────────────────────────────
  for (const loc of localitiesDb) {
    await prisma.locality.upsert({
      where: { name_city: { name: loc.name, city: loc.city } },
      update: {},
      create: {
        name: loc.name,
        city: loc.city,
        avgPricePerSqFt: loc.avgPricePerSqFt,
        yoyGrowth: loc.yoyGrowth,
        lifestyleScore: loc.lifestyleScore,
        connectivityScore: loc.connectivityScore,
        totalListings: loc.totalListings,
        trend: loc.trend
      }
    });
  }
  console.log(`✅ ${localitiesDb.length} localities seeded`);

  console.log('\n🚀 Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('Admin:  admin@nexora.ai / nexora@admin123');
  console.log('User:   test@nexora.ai  / user@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
