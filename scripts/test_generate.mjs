import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");

function extractKeys(buf) {
  const zip = new PizZip(buf);
  const xml = zip.file("word/document.xml").asText();
  const text = xml.replace(/<[^>]+>/g, "");
  const keys = new Set();
  for (const m of text.matchAll(/{{\s*([^{}]+?)\s*}}/g)) keys.add(m[1]);
  return [...keys];
}

let failures = 0;
const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".docx"));

for (const file of files.sort()) {
  const buf = readFileSync(path.join(TEMPLATES_DIR, file));
  const keys = extractKeys(buf);
  const data = Object.fromEntries(keys.map((k) => [k, `«${k}»`]));

  try {
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      delimiters: { start: "{{", end: "}}" },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });
    doc.render(data);
    const out = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });

    // Re-open the generated file and assert no unfilled placeholders remain.
    const check = new PizZip(out);
    const renderedXml = check.file("word/document.xml").asText();
    const leftover = (renderedXml.replace(/<[^>]+>/g, "").match(/{{.*?}}/g) || []);

    const ok = out.length > 1000 && leftover.length === 0;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${file.padEnd(42)} keys=${String(keys.length).padStart(2)} bytes=${out.length}${leftover.length ? ` leftover=${JSON.stringify(leftover)}` : ""}`,
    );
    if (!ok) failures++;
  } catch (e) {
    console.log(`FAIL  ${file.padEnd(42)} ERROR: ${e.message}`);
    failures++;
  }
}

console.log(failures === 0 ? "\nAll templates rendered cleanly." : `\n${failures} template(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
