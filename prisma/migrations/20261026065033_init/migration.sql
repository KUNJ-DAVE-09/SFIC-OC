-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPPLIER', 'CGP_BRANCH', 'TOC_BRANCH', 'QC_BRANCH', 'FRL_FIELD', 'FRL_LAB', 'ADMIN');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('SUPPLIER_INITIATED', 'CROSS_SAMPLING');

-- CreateEnum
CREATE TYPE "CommodityCategory" AS ENUM ('CGP', 'TOC');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('DRAFT', 'OFFER_SUBMITTED', 'BRANCH_REVIEW', 'BRANCH_APPROVED', 'FRL_ASSIGNED', 'FIELD_SAMPLING', 'SAMPLE_RECEIVED_FRL', 'TESTING_IN_PROGRESS', 'REPORT_GENERATED', 'REPORT_COMMUNICATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL_PASS', 'PENDING');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SAMPLE_OFFER', 'FORWARDING_LETTER', 'FIELD_REPORT', 'LAB_RECEIPT', 'QC_REPORT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "gstin" TEXT,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GodownManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "godownName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "godownCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GodownManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleOffer" (
    "id" TEXT NOT NULL,
    "offerNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "commodityName" TEXT NOT NULL,
    "commodityCode" TEXT NOT NULL,
    "category" "CommodityCategory" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'MT',
    "batchNumber" TEXT NOT NULL,
    "manufacturingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "supplierRemarks" TEXT,
    "status" "SampleStatus" NOT NULL DEFAULT 'OFFER_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossSample" (
    "id" TEXT NOT NULL,
    "sampleNumber" TEXT NOT NULL,
    "godownManagerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "godownLocation" TEXT NOT NULL,
    "commodityName" TEXT NOT NULL,
    "commodityCode" TEXT NOT NULL,
    "stockLotNumber" TEXT NOT NULL,
    "category" "CommodityCategory" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'MT',
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "status" "SampleStatus" NOT NULL DEFAULT 'OFFER_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrossSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "sampleCode" TEXT NOT NULL,
    "sampleType" "SampleType" NOT NULL,
    "category" "CommodityCategory" NOT NULL,
    "status" "SampleStatus" NOT NULL DEFAULT 'BRANCH_REVIEW',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "sampleOfferId" TEXT,
    "crossSampleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branchApprovedAt" TIMESTAMP(3),
    "frlAssignedAt" TIMESTAMP(3),
    "fieldSampledAt" TIMESTAMP(3),
    "labReceivedAt" TIMESTAMP(3),
    "testingCompletedAt" TIMESTAMP(3),
    "reportGeneratedAt" TIMESTAMP(3),
    "reportSentAt" TIMESTAMP(3),

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldSamplingRecord" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3),
    "plantAddress" TEXT,
    "sampleWeightKg" DOUBLE PRECISION,
    "sealNumber" TEXT,
    "observations" TEXT,
    "photosUploaded" BOOLEAN NOT NULL DEFAULT false,
    "submittedToLab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldSamplingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestRecord" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "labTechnicianId" TEXT NOT NULL,
    "labReceiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labSampleCode" TEXT,
    "testParameters" JSONB NOT NULL,
    "overallResult" "TestResult" NOT NULL DEFAULT 'PENDING',
    "testingStartedAt" TIMESTAMP(3),
    "testingEndedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "labRecordId" TEXT NOT NULL,
    "result" "TestResult" NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendations" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "communicatedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleOfferId" TEXT,
    "crossSampleId" TEXT,
    "sampleId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAction" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "SampleStatus",
    "toStatus" "SampleStatus" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleOfferId" TEXT,
    "crossSampleId" TEXT,
    "sampleId" TEXT,

    CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleOfferId" TEXT,
    "crossSampleId" TEXT,
    "sampleId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_userId_key" ON "Supplier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GodownManager_userId_key" ON "GodownManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GodownManager_godownCode_key" ON "GodownManager"("godownCode");

-- CreateIndex
CREATE UNIQUE INDEX "SampleOffer_offerNumber_key" ON "SampleOffer"("offerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CrossSample_sampleNumber_key" ON "CrossSample"("sampleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_sampleCode_key" ON "Sample"("sampleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_sampleOfferId_key" ON "Sample"("sampleOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_crossSampleId_key" ON "Sample"("crossSampleId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldSamplingRecord_sampleId_key" ON "FieldSamplingRecord"("sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestRecord_sampleId_key" ON "LabTestRecord"("sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestRecord_labSampleCode_key" ON "LabTestRecord"("labSampleCode");

-- CreateIndex
CREATE UNIQUE INDEX "QCReport_reportNumber_key" ON "QCReport"("reportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QCReport_sampleId_key" ON "QCReport"("sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "QCReport_labRecordId_key" ON "QCReport"("labRecordId");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GodownManager" ADD CONSTRAINT "GodownManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOffer" ADD CONSTRAINT "SampleOffer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOffer" ADD CONSTRAINT "SampleOffer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossSample" ADD CONSTRAINT "CrossSample_godownManagerId_fkey" FOREIGN KEY ("godownManagerId") REFERENCES "GodownManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossSample" ADD CONSTRAINT "CrossSample_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_sampleOfferId_fkey" FOREIGN KEY ("sampleOfferId") REFERENCES "SampleOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_crossSampleId_fkey" FOREIGN KEY ("crossSampleId") REFERENCES "CrossSample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSamplingRecord" ADD CONSTRAINT "FieldSamplingRecord_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSamplingRecord" ADD CONSTRAINT "FieldSamplingRecord_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestRecord" ADD CONSTRAINT "LabTestRecord_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestRecord" ADD CONSTRAINT "LabTestRecord_labTechnicianId_fkey" FOREIGN KEY ("labTechnicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCReport" ADD CONSTRAINT "QCReport_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCReport" ADD CONSTRAINT "QCReport_labRecordId_fkey" FOREIGN KEY ("labRecordId") REFERENCES "LabTestRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sampleOfferId_fkey" FOREIGN KEY ("sampleOfferId") REFERENCES "SampleOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_crossSampleId_fkey" FOREIGN KEY ("crossSampleId") REFERENCES "CrossSample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_sampleOfferId_fkey" FOREIGN KEY ("sampleOfferId") REFERENCES "SampleOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_crossSampleId_fkey" FOREIGN KEY ("crossSampleId") REFERENCES "CrossSample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_sampleOfferId_fkey" FOREIGN KEY ("sampleOfferId") REFERENCES "SampleOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_crossSampleId_fkey" FOREIGN KEY ("crossSampleId") REFERENCES "CrossSample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;
