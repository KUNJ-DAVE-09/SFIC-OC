export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AssignClient } from "./AssignClient";

export default async function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sample, frlStaff] = await Promise.all([
    prisma.sample.findUnique({
      where: { id },
      include: {
        sampleOffer: { include: { supplier: true } },
        crossSample: true,
        workflowActions: {
          orderBy: { createdAt: "asc" },
          include: { actor: { select: { name: true, role: true } } },
        },
      },
    }),
    prisma.user.findMany({ where: { role: "FRL_FIELD", isActive: true } }),
  ]);
  if (!sample) notFound();

  return (
    <AssignClient
      sample={{
        ...sample,
        workflowActions: sample.workflowActions.map((w) => ({
          ...w,
          fromStatus: w.fromStatus ?? undefined,
          createdAt: w.createdAt.toISOString(),
        })),
      }}
      frlStaff={frlStaff.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
    />
  );
}
