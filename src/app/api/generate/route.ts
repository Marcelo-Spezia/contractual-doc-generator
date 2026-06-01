import { NextResponse } from "next/server";
import { buildAuditFields, generateDocx, validatePayload } from "@/lib/generate";
import { appendAuditEntry } from "@/lib/audit";
import { TEMPLATE_SCHEMAS, type TemplateId } from "@/lib/schema";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

interface GenerateBody {
  templateId: TemplateId;
  fields: Record<string, string>;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { templateId, fields } = body;
  if (!templateId || !TEMPLATE_SCHEMAS[templateId]) {
    return NextResponse.json({ error: "Unknown or missing templateId" }, { status: 400 });
  }

  const issues = validatePayload(templateId, fields || {});
  if (issues.length > 0) {
    return NextResponse.json({ error: "Validation failed", issues }, { status: 422 });
  }

  try {
    const { buffer, fileName, meta } = await generateDocx(templateId, fields);
    const auditFields = buildAuditFields(templateId, fields);

    await appendAuditEntry({
      userEmail: session.email, // derived from the signed session cookie, not the request body
      templateId,
      templateVersion: meta.version,
      ...auditFields,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
