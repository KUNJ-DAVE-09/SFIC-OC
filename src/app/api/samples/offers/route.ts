export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SampleStatus, SampleType, CommodityCategory } from "@prisma/client";
import { z } from "zod";

const offerSchema = z.object({
  commodityName: z.string().min(2),
  commodityCode: z.string().min(2),
  category: z.enum(["CGP", "TOC"]),
  quantity: z.number().positive(),
  unit: z.string().default("MT"),
  batchNumber: z.string().min(2),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  supplierRemarks: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where: Record<string, unknown> = {};

  if (session.user.role === "SUPPLIER") {
    const supplier = await prisma.supplier.findUnique({ where: { userId: session.user.id } });
    if (!supplier) return NextResponse.json([]);
    where.supplierId = supplier.id;
  }

  const offers = await prisma.sampleOffer.findMany({
    where,
    include: {
      supplier: { include: { user: { select: { name: true, email: true } } } },
      sample: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supplier = await prisma.supplier.findUnique({ where: { userId: session.user.id } });
  if (!supplier) return NextResponse.json({ error: "Supplier profile not found" }, { status: 404 });

  const data = parsed.data;
  const offerNumber = `OFFER-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const offer = await prisma.sampleOffer.create({
    data: {
      offerNumber,
      supplierId: supplier.id,
      createdById: session.user.id,
      commodityName: data.commodityName,
      commodityCode: data.commodityCode,
      category: data.category as CommodityCategory,
      quantity: data.quantity,
      unit: data.unit,
      batchNumber: data.batchNumber,
      manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      supplierRemarks: data.supplierRemarks,
      status: SampleStatus.OFFER_SUBMITTED,
    },
  });

  // Create sample record
  const sampleCode = `SFIC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  await prisma.sample.create({
    data: {
      sampleCode,
      sampleType: SampleType.SUPPLIER_INITIATED,
      category: data.category as CommodityCategory,
      status: SampleStatus.OFFER_SUBMITTED,
      sampleOfferId: offer.id,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_OFFER",
      entity: "SampleOffer",
      entityId: offer.id,
      sampleOfferId: offer.id,
    },
  });

  // Notify branch users
  const branchRole = data.category === "CGP" ? "CGP_BRANCH" : "TOC_BRANCH";
  const branchUsers = await prisma.user.findMany({ where: { role: branchRole, isActive: true } });
  await prisma.notification.createMany({
    data: branchUsers.map((u) => ({
      userId: u.id,
      title: "New Sample Offer",
      message: `${supplier.companyName} submitted a sample offer for ${data.commodityName}.`,
    })),
  });

  return NextResponse.json(offer, { status: 201 });
}
