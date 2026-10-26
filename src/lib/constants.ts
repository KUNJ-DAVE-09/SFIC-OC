import { SampleStatus, UserRole } from "@prisma/client";

export const STATUS_LABELS: Record<SampleStatus, string> = {
  DRAFT: "Draft",
  OFFER_SUBMITTED: "Offer Submitted",
  BRANCH_REVIEW: "Branch Review",
  BRANCH_APPROVED: "Branch Approved",
  FRL_ASSIGNED: "FRL Assigned",
  FIELD_SAMPLING: "Field Sampling",
  SAMPLE_RECEIVED_FRL: "Received at FRL",
  TESTING_IN_PROGRESS: "Testing In Progress",
  REPORT_GENERATED: "Report Generated",
  REPORT_COMMUNICATED: "Report Communicated",
  REJECTED: "Rejected",
};

export const STATUS_ORDER: SampleStatus[] = [
  "OFFER_SUBMITTED",
  "BRANCH_REVIEW",
  "BRANCH_APPROVED",
  "FRL_ASSIGNED",
  "FIELD_SAMPLING",
  "SAMPLE_RECEIVED_FRL",
  "TESTING_IN_PROGRESS",
  "REPORT_GENERATED",
  "REPORT_COMMUNICATED",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPPLIER: "Supplier",
  CGP_BRANCH: "CGP Branch",
  TOC_BRANCH: "TOC Branch",
  QC_BRANCH: "QC Branch",
  FRL_FIELD: "FRL Field Staff",
  FRL_LAB: "FRL Laboratory",
  ADMIN: "Admin",
};

export const ROLE_HOME: Record<UserRole, string> = {
  SUPPLIER: "/dashboard/supplier",
  CGP_BRANCH: "/dashboard/branch",
  TOC_BRANCH: "/dashboard/branch",
  QC_BRANCH: "/dashboard/qc",
  FRL_FIELD: "/dashboard/field",
  FRL_LAB: "/dashboard/lab",
  ADMIN: "/dashboard/admin",
};

export function getStatusStep(status: SampleStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export function getStatusColor(status: SampleStatus): string {
  if (status === "REJECTED") return "#ff3b30";
  if (status === "REPORT_COMMUNICATED") return "#34c759";
  if (status === "REPORT_GENERATED") return "#34c759";
  if (["TESTING_IN_PROGRESS", "SAMPLE_RECEIVED_FRL", "FIELD_SAMPLING"].includes(status)) return "#ff9500";
  return "#0066cc";
}
