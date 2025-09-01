// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

const money = (v: string) => new Prisma.Decimal(v);

async function upsertProductWithVariants(
  companyId: string,
  name: string,
  code: string | null,
  variants: Array<{
    sku: string;
    barcode?: string | null;
    color?: string | null;
    size?: string | null;
    price: string;
    stock: number;
  }>
) {
  // 1) Buscar producto existente (por code si hay; si no, por name)
  const existing = await prisma.product.findFirst({
    where: { companyId, ...(code ? { code } : { name }) },
    select: { id: true },
  });

  let productId: string;

  if (!existing) {
    // 2) Crear producto
    const created = await prisma.product.create({
      data: { companyId, name, code },
      select: { id: true },
    });
    productId = created.id;

    // 3) Crear variantes
    await prisma.variant.createMany({
      data: variants.map(v => ({
        companyId,
        productId,
        sku: v.sku,
        barcode: v.barcode ?? null,
        color: v.color ?? null,
        size: v.size ?? null,
        price: money(v.price),
        stock: v.stock,
      })),
      skipDuplicates: true,
    });
  } else {
    // 4) Asegurar variantes faltantes
    productId = existing.id;

    const existingSkus = await prisma.variant.findMany({
      where: { productId },
      select: { sku: true },
    });
    const have = new Set(existingSkus.map(e => e.sku));
    const toCreate = variants
      .filter(v => !have.has(v.sku))
      .map(v => ({
        companyId,
        productId,
        sku: v.sku,
        barcode: v.barcode ?? null,
        color: v.color ?? null,
        size: v.size ?? null,
        price: money(v.price),
        stock: v.stock,
      }));

    if (toCreate.length) {
      await prisma.variant.createMany({ data: toCreate, skipDuplicates: true });
    }
  }

  return prisma.product.findUnique({ where: { id: productId } });
}

async function main() {
  // Empresa demo
  const company = await prisma.company.upsert({
    where: { ruc: '1790012345001' },
    update: {},
    create: {
      ruc: '1790012345001',
      name: 'Boutique Demo',
      estab: '001',
      point: '001',
      seq: 1,
    },
  });

  // Admin demo
  await prisma.user.upsert({
    where: { email: 'admin@demo.ec' },
    update: {},
    create: {
      email: 'admin@demo.ec',
      hash: '$2b$10$Q5H0g4HnH9v9TQe8eC2OeOnbQwF4oJxq4oYpQK5FtsZx8Xv5Hn9ma', // "admin123" (cámbialo luego)
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  // Productos demo
  const p1 = await upsertProductWithVariants(company.id, 'Blusa básica', 'BLU-BASE', [
    { sku: 'BLU-BASE-ROJ-S', barcode: '7891234567890', color: 'Rojo',  size: 'S', price: '12.50', stock: 15 },
    { sku: 'BLU-BASE-NEG-M', barcode: '7891234567891', color: 'Negro', size: 'M', price: '12.50', stock: 10 },
  ]);

  const p2 = await upsertProductWithVariants(company.id, 'Jean clásico', 'JEAN-CLAS', [
    { sku: 'JEAN-CLAS-AZU-32', barcode: '7891234567892', color: 'Azul', size: '32', price: '25.90', stock: 8  },
    { sku: 'JEAN-CLAS-AZU-34', barcode: '7891234567893', color: 'Azul', size: '34', price: '25.90', stock: 6  },
  ]);

  // Cliente demo
  const doc = '0102030405';
  const existingClient = await prisma.client.findFirst({
    where: { companyId: company.id, document: doc },
    select: { id: true },
  });
  if (!existingClient) {
    await prisma.client.create({
      data: {
        companyId: company.id,
        documentType: 'CI',
        document: doc,
        name: 'Cliente Demo',
        email: 'cliente@demo.ec',
        phone: '0999999999',
        address: 'Quito',
      },
    });
  }

  const variantsCount = await prisma.variant.count({ where: { companyId: company.id } });

  console.log('🌱 Seed OK:', {
    company: company.name,
    products: [p1?.name, p2?.name],
    variantsTotal: variantsCount,
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
