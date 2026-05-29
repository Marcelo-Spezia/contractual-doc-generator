"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listDrafts, deleteDraft, type Draft } from "@/lib/draft";
import { TEMPLATE_SCHEMAS } from "@/lib/schema";
import type { AuditLogEntry } from "@/lib/audit";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard({ recent }: { recent: AuditLogEntry[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => setDrafts(listDrafts()), []);

  function removeDraft(id: string) {
    deleteDraft(id);
    setDrafts(listDrafts());
  }

  return (
    <div className="fade-in">
      <div className="row between wrap" style={{ marginBottom: "var(--space-8)" }}>
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="title-xl">Legal documents</h1>
          <p className="muted" style={{ marginTop: "var(--space-2)", maxWidth: 560 }}>
            Generate NDAs, MSAs, SOWs, and amendments from canonical, legal-approved templates.
          </p>
        </div>
        <button className="btn lg" onClick={() => router.push("/generator")}>
          Generate document
        </button>
      </div>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <section className="card card-pad">
          <div className="row" style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <img
              src="/ms-ds/assets/icons/svg/SearchDocument.svg"
              alt=""
              style={{ width: 22, height: "auto", objectFit: "contain" }}
            />
            <h3>Recently generated</h3>
          </div>
          {recent.length === 0 ? (
            <div className="empty">No documents generated yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Client</th>
                  <th>Template</th>
                  <th>By</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 700 }}>{e.reference || "—"}</td>
                    <td>{e.clientName || "—"}</td>
                    <td>
                      <span className="pill">{TEMPLATE_SCHEMAS[e.templateId]?.name ?? e.templateId}</span>
                    </td>
                    <td className="faint">{e.userEmail.split("@")[0]}</td>
                    <td className="faint">{fmt(e.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card card-pad">
          <div className="row" style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <img
              src="/ms-ds/assets/icons/svg/Calendar.svg"
              alt=""
              style={{ width: 22, height: "auto", objectFit: "contain" }}
            />
            <h3>My drafts</h3>
          </div>
          {drafts.length === 0 ? (
            <div className="empty">
              <img
                src="/ms-ds/assets/icons/svg/Agreement.svg"
                alt=""
              />
              <div>No saved drafts. Start a new document and it will autosave here.</div>
            </div>
          ) : (
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              {drafts.map((d) => (
                <div
                  className="repeat-item row between"
                  key={d.id}
                  style={{ padding: "var(--space-4)" }}
                >
                  <button
                    className="btn link"
                    style={{ flex: 1, justifyContent: "flex-start", padding: 0 }}
                    onClick={() => router.push(`/generator?draft=${d.id}`)}
                  >
                    <div style={{ textAlign: "left", textTransform: "none", letterSpacing: 0 }}>
                      <div style={{ font: "700 14px/1.3 var(--font-sans)", color: "var(--fg-1)" }}>
                        {d.fields.PROJECT_NAME ||
                          d.fields.SOW_NUMBER ||
                          d.fields.CLIENT_LEGAL_NAME ||
                          d.fields.SOW_REFERENCE ||
                          "Untitled draft"}
                      </div>
                      <div className="faint" style={{ font: "var(--caption)", marginTop: 4 }}>
                        {TEMPLATE_SCHEMAS[d.templateId]?.name} · saved {fmt(d.updatedAt)}
                      </div>
                    </div>
                  </button>
                  <button className="btn danger-link" onClick={() => removeDraft(d.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
