export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    total,
    offerSubmitted,
    branchReview,
    branchApproved,
    frlAssigned,
    fieldSampling,
    receivedFRL,
    testing,
    reportGenerated,
    reportCommunicated,
    rejected,
  ] = await Promise.all([
    prisma.sample.count(),
    prisma.sample.count({ where: { status: "OFFER_SUBMITTED" } }),
    prisma.sample.count({ where: { status: "BRANCH_REVIEW" } }),
    prisma.sample.count({ where: { status: "BRANCH_APPROVED" } }),
    prisma.sample.count({ where: { status: "FRL_ASSIGNED" } }),
    prisma.sample.count({ where: { status: "FIELD_SAMPLING" } }),
    prisma.sample.count({ where: { status: "SAMPLE_RECEIVED_FRL" } }),
    prisma.sample.count({ where: { status: "TESTING_IN_PROGRESS" } }),
    prisma.sample.count({ where: { status: "REPORT_GENERATED" } }),
    prisma.sample.count({ where: { status: "REPORT_COMMUNICATED" } }),
    prisma.sample.count({ where: { status: "REJECTED" } }),
  ]);

  const recentSamples = await prisma.sample.findMany({
    take: 10,
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: { select: { commodityName: true, godownManager: { select: { godownName: true } } } },
    },
  });

  return NextResponse.json({
    counts: {
      total,
      offerSubmitted,
      branchReview,
      branchApproved,
      frlAssigned,
      fieldSampling,
      receivedFRL,
      testing,
      reportGenerated,
      reportCommunicated,
      rejected,
    },
    recentSamples,
  });
}
