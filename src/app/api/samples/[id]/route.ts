export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SampleStatus } from "@prisma/client";

// GET single sample detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: { include: { supplier: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
      crossSample: { include: { godownManager: { include: { user: { select: { name: true } } } } } },
      fieldRecord: { include: { assignedTo: { select: { id: true, name: true, email: true } } } },
      labRecord: true,
      qcReport: true,
      documents: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, role: true } } },
      },
      notifications: { take: 5 },
    },
  });

  if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sample);
}

// PATCH — advance workflow
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, remarks, data } = body;

  const sample = await prisma.sample.findUnique({
    where: { id },
    include: { sampleOffer: true, crossSample: true, fieldRecord: true, labRecord: true },
  });
  if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fromStatus = sample.status;
  let toStatus: SampleStatus = sample.status;
  const updateData: Record<string, unknown> = {};

  switch (action) {
    case "BRANCH_APPROVE":
      if (!["CGP_BRANCH", "TOC_BRANCH"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      toStatus = SampleStatus.BRANCH_APPROVED;
      updateData.status = toStatus;
      updateData.branchApprovedAt = new Date();
      // Update offer/cross-sample status
      if (sample.sampleOfferId)
        await prisma.sampleOffer.update({ where: { id: sample.sampleOfferId }, data: { status: toStatus } });
      if (sample.crossSampleId)
        await prisma.crossSample.update({ where: { id: sample.crossSampleId }, data: { status: toStatus } });
      break;

    case "ASSIGN_FRL":
      if (session.user.role !== "QC_BRANCH") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      toStatus = SampleStatus.FRL_ASSIGNED;
      updateData.status = toStatus;
      updateData.frlAssignedAt = new Date();
      // Create field record
      await prisma.fieldSamplingRecord.upsert({
        where: { sampleId: id },
        update: { assignedToId: data.assignedToId },
        create: { sampleId: id, assignedToId: data.assignedToId },
      });
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          title: "New Field Assignment",
          message: `You have been assigned for field sampling of sample ${sample.sampleCode}.`,
          sampleId: id,
        },
      });
      break;

    case "FIELD_START":
      if (session.user.role !== "FRL_FIELD") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      toStatus = SampleStatus.FIELD_SAMPLING;
      updateData.status = toStatus;
      await prisma.fieldSamplingRecord.update({
        where: { sampleId: id },
        data: {
          visitDate: new Date(),
          plantAddress: data.plantAddress,
          observations: data.observations,
          sealNumber: data.sealNumber,
          sampleWeightKg: data.sampleWeightKg,
        },
      });
      break;

    case "SUBMIT_TO_LAB":
      if (session.user.role !== "FRL_FIELD") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      toStatus = SampleStatus.SAMPLE_RECEIVED_FRL;
      updateData.status = toStatus;
      updateData.fieldSampledAt = new Date();
      await prisma.fieldSamplingRecord.update({
        where: { sampleId: id },
        data: { submittedToLab: true },
      });
      // Notify lab
      const labUsers = await prisma.user.findMany({ where: { role: "FRL_LAB", isActive: true } });
      await prisma.notification.createMany({
        data: labUsers.map((u) => ({
          userId: u.id,
          title: "Sample Received",
          message: `Sample ${sample.sampleCode} has been submitted to the lab.`,
          sampleId: id,
        })),
      });
      break;

    case "LAB_RECEIVE":
      if (session.user.role !== "FRL_LAB") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      toStatus = SampleStatus.TESTING_IN_PROGRESS;
      updateData.status = toStatus;
      updateData.labReceivedAt = new Date();
      await prisma.labTestRecord.upsert({
        where: { sampleId: id },
        update: { labSampleCode: data.labSampleCode, labTechnicianId: session.user.id },
        create: {
          sampleId: id,
          labTechnicianId: session.user.id,
          labSampleCode: data.labSampleCode,
          testParameters: [],
          overallResult: "PENDING",
        },
      });
      break;

    case "SUBMIT_RESULTS":
      if (session.user.role !== "FRL_LAB") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      toStatus = SampleStatus.REPORT_GENERATED;
      updateData.status = toStatus;
      updateData.testingCompletedAt = new Date();
      updateData.reportGeneratedAt = new Date();
      await prisma.labTestRecord.update({
        where: { sampleId: id },
        data: {
          testParameters: data.testParameters,
          overallResult: data.overallResult,
          testingStartedAt: data.testingStartedAt ? new Date(data.testingStartedAt) : undefined,
          testingEndedAt: new Date(),
          remarks: data.remarks,
        },
      });
      // Generate report number
      const reportNumber = `QC-RPT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const labRec = await prisma.labTestRecord.findUnique({ where: { sampleId: id } });
      if (labRec) {
        await prisma.qCReport.create({
          data: {
            reportNumber,
            sampleId: id,
            labRecordId: labRec.id,
            result: data.overallResult,
            summary: data.summary,
            recommendations: data.recommendations,
            generatedAt: new Date(),
          },
        });
      }
      break;

    case "COMMUNICATE_REPORT":
      if (!["FRL_LAB", "QC_BRANCH", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      toStatus = SampleStatus.REPORT_COMMUNICATED;
      updateData.status = toStatus;
      updateData.reportSentAt = new Date();
      await prisma.qCReport.update({
        where: { sampleId: id },
        data: { communicatedAt: new Date() },
      });
      // Notify all relevant parties
      const fullSample = await prisma.sample.findUnique({
        where: { id },
        include: {
          sampleOffer: { include: { supplier: true, createdBy: true } },
          qcReport: true,
        },
      });
      if (fullSample?.sampleOffer?.createdById) {
        await prisma.notification.create({
          data: {
            userId: fullSample.sampleOffer.createdById,
            title: "QC Report Available",
            message: `QC Report for sample ${sample.sampleCode} is now available. Result: ${fullSample.qcReport?.result}`,
            sampleId: id,
          },
        });
      }
      break;

    case "REJECT":
      toStatus = SampleStatus.REJECTED;
      updateData.status = toStatus;
      if (sample.sampleOfferId)
        await prisma.sampleOffer.update({ where: { id: sample.sampleOfferId }, data: { status: toStatus } });
      if (sample.crossSampleId)
        await prisma.crossSample.update({ where: { id: sample.crossSampleId }, data: { status: toStatus } });
      break;

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await prisma.sample.update({ where: { id }, data: updateData });

  // Record workflow action
  await prisma.workflowAction.create({
    data: {
      actorId: session.user.id,
      fromStatus,
      toStatus,
      remarks,
      sampleId: id,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action,
      entity: "Sample",
      entityId: id,
      metadata: { fromStatus, toStatus, remarks },
      sampleId: id,
    },
  });

  return NextResponse.json(updated);
}
