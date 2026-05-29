"""Rewrite ambiguous placeholders in the Fixed Fee SOW template to unique indexed keys.

Each placeholder token in 01_SOW_Template_Fixed_Fee.docx lives in its own <w:t> run,
so an ordered, document-order single-pass replacement is lossless and preserves all
formatting. We replace the first remaining occurrence of each source token in order.
"""
import shutil
import sys
import zipfile
from pathlib import Path

SRC = Path(sys.argv[1])
BACKUP = SRC.with_suffix(".docx.orig")

# (source_token, replacement) in exact document order. Each entry consumes the
# first still-present occurrence of source_token.
REPLACEMENTS = [
    ("{{...}}", "{{OBJECTIVE_1}}"),
    ("{{...}}", "{{OBJECTIVE_2}}"),
    ("{{...}}", "{{OBJECTIVE_3}}"),
    ("{{description, depth, format, number of revision rounds included}}", "{{DELIVERABLE_1}}"),
    ("{{description, depth, format, number of revision rounds included}}", "{{DELIVERABLE_2}}"),
    ("{{description, depth, format, number of revision rounds included}}", "{{DELIVERABLE_3}}"),
    ("{{...}}", "{{CRITERIA_1}}"),
    ("{{...}}", "{{CRITERIA_2}}"),
    ("{{...}}", "{{CRITERIA_3}}"),
    ("{{Out-of-scope item 1}}", "{{OUT_OF_SCOPE_1}}"),
    ("{{Out-of-scope item 2}}", "{{OUT_OF_SCOPE_2}}"),
    ("{{Out-of-scope item 3}}", "{{OUT_OF_SCOPE_3}}"),
    ("{{...}}", "{{ASSUMPTION_CLIENT}}"),
    ("{{...}}", "{{ASSUMPTION_DEPENDENCIES}}"),
    ("{{...}}", "{{ASSUMPTION_ENVIRONMENT}}"),
    ("{{e.g., CLIENT feedback within 3 business days}}", "{{ASSUMPTION_FEEDBACK}}"),
    ("{{...}}", "{{ASSUMPTION_ACCESS}}"),
    ("{{...}}", "{{ASSUMPTION_REGULATORY}}"),
    ("{{description}}", "{{MILESTONE_1_DESC}}"),
    ("{{date}}", "{{MILESTONE_1_DATE}}"),
    ("{{description}}", "{{MILESTONE_2_DESC}}"),
    ("{{date}}", "{{MILESTONE_2_DATE}}"),
    ("{{description}}", "{{MILESTONE_3_DESC}}"),
    ("{{date}}", "{{MILESTONE_3_DATE}}"),
    ("{{date}}", "{{FINAL_DELIVERY_DATE}}"),
    ("{{description}}", "{{RISK_1_DESC}}"),
    ("{{description}}", "{{RISK_1_MITIGATION}}"),
    ("{{description}}", "{{RISK_2_DESC}}"),
    ("{{description}}", "{{RISK_2_MITIGATION}}"),
    ("{{description}}", "{{RISK_3_DESC}}"),
    ("{{description}}", "{{RISK_3_MITIGATION}}"),
]


def apply_ordered(xml: str) -> str:
    cursor = 0
    out = []
    for old, new in REPLACEMENTS:
        idx = xml.find(old, cursor)
        if idx == -1:
            raise SystemExit(f"FAILED: could not find {old!r} after position {cursor}")
        out.append(xml[cursor:idx])
        out.append(new)
        cursor = idx + len(old)
    out.append(xml[cursor:])
    return "".join(out)


def main():
    if not BACKUP.exists():
        shutil.copy2(SRC, BACKUP)
        print(f"Backed up original -> {BACKUP.name}")

    with zipfile.ZipFile(BACKUP, "r") as zin:
        names = zin.namelist()
        doc = zin.read("word/document.xml").decode("utf-8")
        others = {n: zin.read(n) for n in names if n != "word/document.xml"}

    new_doc = apply_ordered(doc).encode("utf-8")

    with zipfile.ZipFile(SRC, "w", zipfile.ZIP_DEFLATED) as zout:
        for n in names:
            if n == "word/document.xml":
                zout.writestr(n, new_doc)
            else:
                zout.writestr(n, others[n])
    print("Rewrite complete.")


if __name__ == "__main__":
    main()
