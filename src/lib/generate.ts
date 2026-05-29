import { readFile } from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { TEMPLATE_SCHEMAS, type TemplateId } from "./schema";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  version: string;
  fileName: string;
  lastApprovedDate: string;
  approvedBy: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");

export async function loadTemplateMeta(): Promise<Record<TemplateId, TemplateMeta>> {
  const raw = await readFile(path.join(DATA_DIR, "template_meta.json"), "utf8");
  return JSON.parse(raw);
}

export interface ValidationIssue {
  field?: string;
  message: string;
}

export function validatePayload(
  templateId: TemplateId,
  fields: Record<string, string>,
): ValidationIssue[] {
  const schema = TEMPLATE_SCHEMAS[templateId];
  if (!schema) return [{ message: `Unknown template: ${templateId}` }];
  const issues: ValidationIssue[] = [];

  // Required + pattern checks driven by the schema (scalar groups only — repeat group items are optional past minItems).
  for (const g of schema.groups) {
    if (g.kind !== "scalar") continue;
    for (const f of g.fields) {
      const v = (fields[f.key] ?? "").trim();
      if (f.required && !v) {
        issues.push({ field: f.key, message: `${f.label} is required` });
      } else if (v && f.pattern && !new RegExp(f.pattern).test(v)) {
        issues.push({ field: f.key, message: `${f.label} has an invalid format` });
      }
    }
  }

  // Cross-field date checks.
  if (fields.EFFECTIVE_DATE && fields.END_DATE && new Date(fields.END_DATE) <= new Date(fields.EFFECTIVE_DATE))
    issues.push({ field: "END_DATE", message: "Project End Date must be after the Effective Date" });
  if (
    fields.EFFECTIVE_DATE &&
    fields.EXPIRATION_DATE &&
    new Date(fields.EXPIRATION_DATE) <= new Date(fields.EFFECTIVE_DATE)
  )
    issues.push({ field: "EXPIRATION_DATE", message: "Expiration Date must be after the Effective Date" });

  // Fixed-fee milestone sum.
  if (templateId === "fixed_fee") {
    const p1 = Number(fields.PAYMENT_MILESTONE_1_PERCENT || 0);
    const p2 = Number(fields.PAYMENT_MILESTONE_2_PERCENT || 0);
    const p3 = Number(fields.PAYMENT_MILESTONE_3_PERCENT || 0);
    if (p1 + p2 + p3 !== 100)
      issues.push({
        field: "PAYMENT_MILESTONE_1_PERCENT",
        message: `Payment milestone percentages must sum to 100 (currently ${p1 + p2 + p3})`,
      });
  }

  return issues;
}

export interface GenerateResult {
  buffer: Buffer;
  fileName: string;
  meta: TemplateMeta;
}

function downloadFileName(templateId: TemplateId, fields: Record<string, string>): string {
  const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "_");
  if (templateId === "nda") return `NDA_${safe(fields.CLIENT_LEGAL_NAME || "client")}.docx`;
  if (templateId === "msa") return `MSA_${safe(fields.CLIENT_LEGAL_NAME || "client")}.docx`;
  if (templateId === "amendment")
    return `Amendment_${safe(fields.SOW_REFERENCE || "SOW")}_n${safe(fields.AMENDMENT_NUMBER || "1")}.docx`;
  return `${safe(fields.SOW_NUMBER || "SOW")}_${templateId}.docx`;
}

export async function generateDocx(
  templateId: TemplateId,
  fields: Record<string, string>,
): Promise<GenerateResult> {
  const allMeta = await loadTemplateMeta();
  const meta = allMeta[templateId];
  if (!meta) throw new Error(`Unknown template: ${templateId}`);

  const templateBuf = await readFile(path.join(TEMPLATES_DIR, meta.fileName));
  const zip = new PizZip(templateBuf);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });

  doc.render(fields);
  const buffer = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer;

  return { buffer, fileName: downloadFileName(templateId, fields), meta };
}

/** Audit-log fields adapt to which template was generated. */
export function buildAuditFields(
  templateId: TemplateId,
  fields: Record<string, string>,
): { clientName: string; projectName: string; reference: string } {
  if (templateId === "amendment")
    return {
      clientName: fields.CLIENT_LEGAL_NAME || "",
      projectName: "",
      reference: `${fields.SOW_REFERENCE || ""}#${fields.AMENDMENT_NUMBER || ""}`,
    };
  if (templateId === "nda" || templateId === "msa")
    return { clientName: fields.CLIENT_LEGAL_NAME || "", projectName: "", reference: "" };
  return {
    clientName: fields.CLIENT_LEGAL_NAME || "",
    projectName: fields.PROJECT_NAME || "",
    reference: fields.SOW_NUMBER || "",
  };
}
