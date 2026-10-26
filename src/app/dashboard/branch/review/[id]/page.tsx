export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReviewPageClient } from "./ReviewClient";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: { include: { supplier: true } },
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });
  if (!sample) notFound();

  const offer = sample.sampleOffer
    ? {
        offerNumber: sample.sampleOffer.offerNumber,
        commodityName: sample.sampleOffer.commodityName,
        commodityCode: sample.sampleOffer.commodityCode,
        category: sample.sampleOffer.category,
        quantity: sample.sampleOffer.quantity,
        unit: sample.sampleOffer.unit,
        batchNumber: sample.sampleOffer.batchNumber,
        supplierRemarks: sample.sampleOffer.supplierRemarks,
        supplier: {
          companyName: sample.sampleOffer.supplier.companyName,
          gstin: sample.sampleOffer.supplier.gstin,
          address: sample.sampleOffer.supplier.address,
          contactPerson: sample.sampleOffer.supplier.contactPerson,
        },
      }
    : null;

  return (
    <ReviewPageClient
      sample={{
        id: sample.id,
        sampleCode: sample.sampleCode,
        status: sample.status,
        sampleOffer: offer,
        workflowActions: sample.workflowActions.map((w) => ({
          toStatus: w.toStatus,
          fromStatus: w.fromStatus ?? undefined,
          createdAt: w.createdAt.toISOString(),
          actor: w.actor,
          remarks: w.remarks,
        })),
      }}
    />
  );
}
