import { NextResponse } from "next/server";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import { loadTemplateMeta, type TemplateMeta } from "@/lib/generate";
import { TEMPLATE_SCHEMAS, type TemplateId } from "@/lib/schema";

export const runtime = "nodejs";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");
const META_PATH = path.join(process.cwd(), "data", "template_meta.json");

export async function GET() {
  const meta = await loadTemplateMeta();
  return NextResponse.json(meta);
}

function bumpVersion(version: string): string {
  const m = version.match(/^v(\d+)\.(\d+)$/);
  if (!m) return "v1.1";
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });

  const templateId = String(form.get("templateId") || "") as TemplateId;
  const userEmail = String(form.get("userEmail") || "");
  const file = form.get("file");

  if (!TEMPLATE_SCHEMAS[templateId])
    return NextResponse.json({ error: "Unknown templateId" }, { status: 400 });
  if (!/@makingsense\.com$/i.test(userEmail))
    return NextResponse.json({ error: "A @makingsense.com admin email is required" }, { status: 401 });
  if (!(file instanceof File))
    return NextResponse.json({ error: "A template file is required" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());

  // Validate it is a real .docx (zip containing word/document.xml).
  try {
    const zip = new PizZip(buf);
    if (!zip.file("word/document.xml")) throw new Error("missing word/document.xml");
  } catch {
    return NextResponse.json({ error: "Uploaded file is not a valid .docx" }, { status: 422 });
  }

  const allMeta = await loadTemplateMeta();
  const meta = allMeta[templateId];
  const target = path.join(TEMPLATES_DIR, meta.fileName);

  // Keep a versioned backup of the file being replaced.
  const backup = path.join(TEMPLATES_DIR, `${meta.fileName}.${meta.version}.bak`);
  await copyFile(target, backup).catch(() => {});
  await writeFile(target, buf);

  const updated: TemplateMeta = {
    ...meta,
    version: bumpVersion(meta.version),
    lastApprovedDate: new Date().toISOString().slice(0, 10),
    approvedBy: userEmail,
  };
  allMeta[templateId] = updated;
  await writeFile(META_PATH, JSON.stringify(allMeta, null, 2), "utf8");

  return NextResponse.json({ ok: true, meta: updated });
}
