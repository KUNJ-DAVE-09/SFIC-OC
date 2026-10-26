export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LabEntryClient } from "./LabEntryClient";

export default async function LabPendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: true,
      crossSample: true,
      labRecord: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });
  if (!sample) notFound();

  return (
    <LabEntryClient
      sample={{
        ...sample,
        labRecord: sample.labRecord
          ? {
              labSampleCode: sample.labRecord.labSampleCode,
              overallResult: sample.labRecord.overallResult,
              testParameters: sample.labRecord.testParameters,
              remarks: sample.labRecord.remarks,
            }
          : null,
        workflowActions: sample.workflowActions.map((w) => ({
          ...w,
          fromStatus: w.fromStatus ?? undefined,
          createdAt: w.createdAt.toISOString(),
        })),
      }}
    />
  );
}
