export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { CommodityCategory, SampleStatus, SampleType } from "@prisma/client";

const schema = z.object({
  commodityName: z.string().min(2),
  commodityCode: z.string().min(2),
  category: z.enum(["CGP", "TOC"]),
  stockLotNumber: z.string().min(2),
  quantity: z.number().positive(),
  unit: z.string().default("MT"),
  collectionDate: z.string(),
  remarks: z.string().optional(),
  godownLocation: z.string().min(2),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const crosses = await prisma.crossSample.findMany({
    include: {
      godownManager: { include: { user: { select: { name: true } } } },
      sample: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(crosses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["QC_BRANCH", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const godownManager = await prisma.godownManager.findFirst({ where: { userId: session.user.id } });
  const manager = godownManager ?? await prisma.godownManager.findFirst();
  if (!manager) return NextResponse.json({ error: "No godown manager found" }, { status: 404 });

  const data = parsed.data;
  const sampleNumber = `CROSS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const cross = await prisma.crossSample.create({
    data: {
      sampleNumber,
      godownManagerId: manager.id,
      createdById: session.user.id,
      godownLocation: data.godownLocation,
      commodityName: data.commodityName,
      commodityCode: data.commodityCode,
      category: data.category as CommodityCategory,
      stockLotNumber: data.stockLotNumber,
      quantity: data.quantity,
      unit: data.unit,
      collectionDate: new Date(data.collectionDate),
      remarks: data.remarks,
      status: SampleStatus.OFFER_SUBMITTED,
    },
  });

  const sampleCode = `SFIC-${new Date().getFullYear()}-X${String(Date.now()).slice(-4)}`;
  await prisma.sample.create({
    data: {
      sampleCode,
      sampleType: SampleType.CROSS_SAMPLING,
      category: data.category as CommodityCategory,
      status: SampleStatus.BRANCH_REVIEW,
      crossSampleId: cross.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_CROSS_SAMPLE",
      entity: "CrossSample",
      entityId: cross.id,
      crossSampleId: cross.id,
    },
  });

  return NextResponse.json(cross, { status: 201 });
}
