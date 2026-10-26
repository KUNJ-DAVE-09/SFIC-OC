export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FieldUpdateClient } from "./FieldUpdateClient";

export default async function FieldUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: { include: { supplier: true } },
      crossSample: true,
      fieldRecord: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });
  if (!sample || !sample.fieldRecord) notFound();

  return (
    <FieldUpdateClient
      record={{
        ...sample.fieldRecord,
        visitDate: sample.fieldRecord.visitDate?.toISOString() ?? null,
      }}
      sample={{
        ...sample,
        workflowActions: sample.workflowActions.map((w) => ({
          ...w,
          fromStatus: w.fromStatus ?? undefined,
          createdAt: w.createdAt.toISOString(),
        })),
      }}
    />
  );
}
