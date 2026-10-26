export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SampleStatus } from "@prisma/client";

// GET all samples with full pipeline data
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as SampleStatus | null;
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.sampleType = type;

  // Role-based filtering
  if (session.user.role === "SUPPLIER") {
    const supplier = await prisma.supplier.findUnique({ where: { userId: session.user.id } });
    if (supplier) {
      where.sampleOffer = { supplierId: supplier.id };
    }
  }
  if (session.user.role === "FRL_FIELD") {
    where.fieldRecord = { assignedToId: session.user.id };
  }

  const samples = await prisma.sample.findMany({
    where,
    include: {
      sampleOffer: {
        include: { supplier: { include: { user: { select: { name: true } } } } },
      },
      crossSample: { include: { godownManager: true } },
      fieldRecord: { include: { assignedTo: { select: { name: true } } } },
      labRecord: true,
      qcReport: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
    orderBy: { receivedAt: "desc" },
  });

  return NextResponse.json(samples);
}
