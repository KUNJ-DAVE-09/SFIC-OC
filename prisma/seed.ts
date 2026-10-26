import { PrismaClient, UserRole, CommodityCategory, SampleType, SampleStatus, TestResult } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ─────────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gscscl.gov.in" },
    update: {},
    create: {
      name: "GSCSCL Admin",
      email: "admin@gscscl.gov.in",
      passwordHash: hash("Admin@123"),
      role: UserRole.ADMIN,
      department: "Administration",
    },
  });

  const cgpUser = await prisma.user.upsert({
    where: { email: "cgp.officer@gscscl.gov.in" },
    update: {},
    create: {
      name: "Ramesh Patel",
      email: "cgp.officer@gscscl.gov.in",
      passwordHash: hash("Branch@123"),
      role: UserRole.CGP_BRANCH,
      department: "CGP Branch",
    },
  });

  const tocUser = await prisma.user.upsert({
    where: { email: "toc.officer@gscscl.gov.in" },
    update: {},
    create: {
      name: "Sunita Sharma",
      email: "toc.officer@gscscl.gov.in",
      passwordHash: hash("Branch@123"),
      role: UserRole.TOC_BRANCH,
      department: "TOC Branch",
    },
  });

  const qcUser = await prisma.user.upsert({
    where: { email: "qc.officer@gscscl.gov.in" },
    update: {},
    create: {
      name: "Ajay Mehta",
      email: "qc.officer@gscscl.gov.in",
      passwordHash: hash("QC@Branch123"),
      role: UserRole.QC_BRANCH,
      department: "QC Branch",
    },
  });

  const frlFieldUser = await prisma.user.upsert({
    where: { email: "frl.field@gscscl.gov.in" },
    update: {},
    create: {
      name: "Deepak Yadav",
      email: "frl.field@gscscl.gov.in",
      passwordHash: hash("FRL@Field123"),
      role: UserRole.FRL_FIELD,
      department: "FRL Field",
    },
  });

  const frlLabUser = await prisma.user.upsert({
    where: { email: "frl.lab@gscscl.gov.in" },
    update: {},
    create: {
      name: "Priya Singh",
      email: "frl.lab@gscscl.gov.in",
      passwordHash: hash("FRL@Lab123"),
      role: UserRole.FRL_LAB,
      department: "FRL Laboratory",
    },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: "supplier@agrofresh.in" },
    update: {},
    create: {
      name: "Vikram Agrawal",
      email: "supplier@agrofresh.in",
      passwordHash: hash("Supplier@123"),
      role: UserRole.SUPPLIER,
    },
  });

  const godownUser = await prisma.user.upsert({
    where: { email: "godown.mgr@gscscl.gov.in" },
    update: {},
    create: {
      name: "Suresh Bhai",
      email: "godown.mgr@gscscl.gov.in",
      passwordHash: hash("Godown@123"),
      role: UserRole.QC_BRANCH,
      department: "Godown - Ahmedabad Central",
    },
  });

  // ── Supplier Profile ──────────────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      companyName: "AgroFresh Commodities Pvt Ltd",
      gstin: "24ABCDE1234F1Z5",
      address: "Plot 45, GIDC Phase 2, Vatva, Ahmedabad - 382445",
      contactPerson: "Vikram Agrawal",
    },
  });

  // ── Godown Manager ────────────────────────────────────────────────────────
  const godownManager = await prisma.godownManager.upsert({
    where: { userId: godownUser.id },
    update: {},
    create: {
      userId: godownUser.id,
      godownName: "GSCSCL Central Godown",
      location: "Ahmedabad Central, Gujarat",
      godownCode: "GDN-AMD-001",
    },
  });

  // ── Sample Offer 1 — In Progress ─────────────────────────────────────────
  const offer1 = await prisma.sampleOffer.upsert({
    where: { offerNumber: "OFFER-2026-001" },
    update: {},
    create: {
      offerNumber: "OFFER-2026-001",
      supplierId: supplier.id,
      createdById: supplierUser.id,
      commodityName: "Chana Dal (Split Chickpea)",
      commodityCode: "CGP-CD-001",
      category: CommodityCategory.CGP,
      quantity: 50,
      unit: "MT",
      batchNumber: "BATCH-AF-2026-04",
      manufacturingDate: new Date("2026-03-01"),
      expiryDate: new Date("2027-03-01"),
      supplierRemarks: "Premium grade chana dal, BIS certified processing unit",
      status: SampleStatus.BRANCH_APPROVED,
    },
  });

  const sample1 = await prisma.sample.upsert({
    where: { sampleCode: "SFIC-2026-0001" },
    update: {},
    create: {
      sampleCode: "SFIC-2026-0001",
      sampleType: SampleType.SUPPLIER_INITIATED,
      category: CommodityCategory.CGP,
      status: SampleStatus.FIELD_SAMPLING,
      sampleOfferId: offer1.id,
      receivedAt: new Date("2026-10-20"),
      branchApprovedAt: new Date("2026-10-21"),
      frlAssignedAt: new Date("2026-10-22"),
    },
  });

  await prisma.fieldSamplingRecord.upsert({
    where: { sampleId: sample1.id },
    update: {},
    create: {
      sampleId: sample1.id,
      assignedToId: frlFieldUser.id,
      visitDate: new Date("2026-10-23"),
      plantAddress: "Plot 45, GIDC Phase 2, Vatva, Ahmedabad",
      sealNumber: "SEAL-FRL-0012",
      observations: "Plant hygienic. Bags stacked properly. Sample drawn from 5 lots.",
      photosUploaded: true,
      submittedToLab: false,
    },
  });

  // ── Sample Offer 2 — Report Generated ────────────────────────────────────
  const offer2 = await prisma.sampleOffer.upsert({
    where: { offerNumber: "OFFER-2026-002" },
    update: {},
    create: {
      offerNumber: "OFFER-2026-002",
      supplierId: supplier.id,
      createdById: supplierUser.id,
      commodityName: "Moong Dal (Green Gram Split)",
      commodityCode: "CGP-MD-002",
      category: CommodityCategory.CGP,
      quantity: 30,
      unit: "MT",
      batchNumber: "BATCH-AF-2026-03",
      manufacturingDate: new Date("2026-02-15"),
      expiryDate: new Date("2027-02-15"),
      status: SampleStatus.REPORT_COMMUNICATED,
    },
  });

  const sample2 = await prisma.sample.upsert({
    where: { sampleCode: "SFIC-2026-0002" },
    update: {},
    create: {
      sampleCode: "SFIC-2026-0002",
      sampleType: SampleType.SUPPLIER_INITIATED,
      category: CommodityCategory.CGP,
      status: SampleStatus.REPORT_COMMUNICATED,
      sampleOfferId: offer2.id,
      receivedAt: new Date("2026-10-01"),
      branchApprovedAt: new Date("2026-10-02"),
      frlAssignedAt: new Date("2026-10-03"),
      fieldSampledAt: new Date("2026-10-05"),
      labReceivedAt: new Date("2026-10-06"),
      testingCompletedAt: new Date("2026-10-10"),
      reportGeneratedAt: new Date("2026-10-11"),
      reportSentAt: new Date("2026-10-12"),
    },
  });

  const labRecord2 = await prisma.labTestRecord.upsert({
    where: { sampleId: sample2.id },
    update: {},
    create: {
      sampleId: sample2.id,
      labTechnicianId: frlLabUser.id,
      labSampleCode: "FRL-LAB-2026-0042",
      labReceiptDate: new Date("2026-10-06"),
      testParameters: [
        { param: "Moisture Content", expected: "≤ 14%", actual: "12.8%", unit: "%", result: "PASS" },
        { param: "Foreign Matter", expected: "≤ 1%", actual: "0.5%", unit: "%", result: "PASS" },
        { param: "Damaged Grains", expected: "≤ 3%", actual: "1.2%", unit: "%", result: "PASS" },
        { param: "Weevilled Grains", expected: "0%", actual: "0%", unit: "%", result: "PASS" },
        { param: "Admixture", expected: "≤ 2%", actual: "1.8%", unit: "%", result: "PASS" },
      ],
      overallResult: TestResult.PASS,
      testingStartedAt: new Date("2026-10-07"),
      testingEndedAt: new Date("2026-10-10"),
      remarks: "All parameters within permissible limits.",
    },
  });

  await prisma.qCReport.upsert({
    where: { sampleId: sample2.id },
    update: {},
    create: {
      reportNumber: "QC-RPT-2026-0042",
      sampleId: sample2.id,
      labRecordId: labRecord2.id,
      result: TestResult.PASS,
      summary: "Moong Dal sample meets all quality parameters as per GSCSCL standards.",
      recommendations: "Approved for procurement. Ensure cold storage during transit.",
      generatedAt: new Date("2026-10-11"),
      communicatedAt: new Date("2026-10-12"),
    },
  });

  // ── Cross Sample ──────────────────────────────────────────────────────────
  const cross1 = await prisma.crossSample.upsert({
    where: { sampleNumber: "CROSS-2026-001" },
    update: {},
    create: {
      sampleNumber: "CROSS-2026-001",
      godownManagerId: godownManager.id,
      createdById: godownUser.id,
      godownLocation: "GSCSCL Central Godown, Ahmedabad",
      commodityName: "Wheat (Lokwan)",
      commodityCode: "CGP-WH-003",
      category: CommodityCategory.CGP,
      stockLotNumber: "STOCK-AMD-2026-089",
      quantity: 200,
      unit: "MT",
      collectionDate: new Date("2026-10-18"),
      remarks: "Periodic cross-check of stored Lokwan wheat",
      status: SampleStatus.SAMPLE_RECEIVED_FRL,
    },
  });

  const sample3 = await prisma.sample.upsert({
    where: { sampleCode: "SFIC-2026-0003" },
    update: {},
    create: {
      sampleCode: "SFIC-2026-0003",
      sampleType: SampleType.CROSS_SAMPLING,
      category: CommodityCategory.CGP,
      status: SampleStatus.TESTING_IN_PROGRESS,
      crossSampleId: cross1.id,
      receivedAt: new Date("2026-10-18"),
      branchApprovedAt: new Date("2026-10-19"),
      frlAssignedAt: new Date("2026-10-19"),
      fieldSampledAt: new Date("2026-10-20"),
      labReceivedAt: new Date("2026-10-21"),
    },
  });

  await prisma.labTestRecord.upsert({
    where: { sampleId: sample3.id },
    update: {},
    create: {
      sampleId: sample3.id,
      labTechnicianId: frlLabUser.id,
      labSampleCode: "FRL-LAB-2026-0043",
      labReceiptDate: new Date("2026-10-21"),
      testParameters: [
        { param: "Moisture Content", expected: "≤ 14%", actual: "13.5%", unit: "%", result: "PASS" },
        { param: "Foreign Matter", expected: "≤ 1%", actual: "0.8%", unit: "%", result: "PASS" },
        { param: "Insect Damage", expected: "0%", actual: "Pending", unit: "%", result: "PENDING" },
      ],
      overallResult: TestResult.PENDING,
      testingStartedAt: new Date("2026-10-22"),
      remarks: "Testing in progress.",
    },
  });

  // ── Workflow Actions (audit trail for sample1) ────────────────────────────
  const wfData = [
    { actorId: supplierUser.id, from: null, to: SampleStatus.OFFER_SUBMITTED, remarks: "Sample offer submitted by supplier" },
    { actorId: cgpUser.id, from: SampleStatus.OFFER_SUBMITTED, to: SampleStatus.BRANCH_REVIEW, remarks: "Received by CGP branch for review" },
    { actorId: cgpUser.id, from: SampleStatus.BRANCH_REVIEW, to: SampleStatus.BRANCH_APPROVED, remarks: "Offer verified. Forwarding to FRL." },
    { actorId: qcUser.id, from: SampleStatus.BRANCH_APPROVED, to: SampleStatus.FRL_ASSIGNED, remarks: "FRL field staff assigned" },
    { actorId: frlFieldUser.id, from: SampleStatus.FRL_ASSIGNED, to: SampleStatus.FIELD_SAMPLING, remarks: "Field visit initiated" },
  ];

  for (const w of wfData) {
    await prisma.workflowAction.create({
      data: {
        actorId: w.actorId,
        fromStatus: w.from as SampleStatus | null,
        toStatus: w.to as SampleStatus,
        remarks: w.remarks,
        sampleId: sample1.id,
      },
    });
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: cgpUser.id,
        title: "New Sample Offer",
        message: "AgroFresh has submitted a new sample offer for Chana Dal.",
        link: `/samples/${sample1.id}`,
        sampleId: sample1.id,
      },
      {
        userId: frlFieldUser.id,
        title: "Field Assignment",
        message: "You have been assigned for field sampling of SFIC-2026-0001.",
        link: `/samples/${sample1.id}`,
        sampleId: sample1.id,
      },
      {
        userId: supplierUser.id,
        title: "QC Report Ready",
        message: "QC Report for Moong Dal (SFIC-2026-0002) is now available.",
        link: `/samples/${sample2.id}`,
        sampleId: sample2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete.");
  console.log("📋 Demo accounts:");
  console.log("   admin@gscscl.gov.in       / Admin@123");
  console.log("   cgp.officer@gscscl.gov.in / Branch@123");
  console.log("   toc.officer@gscscl.gov.in / Branch@123");
  console.log("   qc.officer@gscscl.gov.in  / QC@Branch123");
  console.log("   frl.field@gscscl.gov.in   / FRL@Field123");
  console.log("   frl.lab@gscscl.gov.in     / FRL@Lab123");
  console.log("   supplier@agrofresh.in      / Supplier@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
