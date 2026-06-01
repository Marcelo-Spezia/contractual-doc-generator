import { NextResponse } from "next/server";
import { writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import { loadTemplateMeta, type TemplateMeta } from "@/lib/generate";
import { TEMPLATE_SCHEMAS, type TemplateId } from "@/lib/schema";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");
const META_PATH = path.join(process.cwd(), "data", "template_meta.json");

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const meta = await loadTemplateMeta();
  return NextResponse.json(meta);
}

function bumpVersion(version: string): string {
  const m = version.match(/^v(\d+)\.(\d+)$/);
  if (!m) return "v1.1";
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "admin")
    return NextResponse.json({ error: "Admin role required to replace templates" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });

  const templateId = String(form.get("templateId") || "") as TemplateId;
  const file = form.get("file");

  if (!TEMPLATE_SCHEMAS[templateId])
    return NextResponse.json({ error: "Unknown templateId" }, { status: 400 });
  if (!(file instanceof File))
    return NextResponse.json({ error: "A template file is required" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const zip = new PizZip(buf);
    if (!zip.file("word/document.xml")) throw new Error("missing word/document.xml");
  } catch {
    return NextResponse.json({ error: "Uploaded file is not a valid .docx" }, { status: 422 });
  }

  const allMeta = await loadTemplateMeta();
  const meta = allMeta[templateId];
  const target = path.join(TEMPLATES_DIR, meta.fileName);

  const backup = path.join(TEMPLATES_DIR, `${meta.fileName}.${meta.version}.bak`);
  await copyFile(target, backup).catch(() => {});
  await writeFile(target, buf);

  const updated: TemplateMeta = {
    ...meta,
    version: bumpVersion(meta.version),
    lastApprovedDate: new Date().toISOString().slice(0, 10),
    approvedBy: session.email,
  };
  allMeta[templateId] = updated;
  await writeFile(META_PATH, JSON.stringify(allMeta, null, 2), "utf8");

  return NextResponse.json({ ok: true, meta: updated });
}
