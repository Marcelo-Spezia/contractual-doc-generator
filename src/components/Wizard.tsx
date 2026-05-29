"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TEMPLATE_SCHEMAS,
  SERVICE_MODELS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_META,
  MS_ADDRESS_BY_ENTITY,
  documentTypeOf,
  type TemplateId,
  type ServiceModel,
  type DocumentType,
  type FieldDef,
  type RepeatGroup,
} from "@/lib/schema";
import { getUser, saveDraft, getDraft, type Draft } from "@/lib/draft";

type Phase = "doctype" | "model" | "details";

const ICON_BASE = "/ms-ds/assets/icons/svg/";
const TEMPLATE_ICON: Record<TemplateId, string> = {
  fixed_fee: `${ICON_BASE}Currency.svg`,
  monthly_team: `${ICON_BASE}People.svg`,
  monthly_individual: `${ICON_BASE}User.svg`,
  tm: `${ICON_BASE}Cycle.svg`,
  ai_pod: `${ICON_BASE}ArtificialIntelligence.svg`,
  nda: `${ICON_BASE}Shield.svg`,
  msa: `${ICON_BASE}Legal.svg`,
  amendment: `${ICON_BASE}Configuration.svg`,
};
const DOCTYPE_ICON: Record<DocumentType, string> = {
  sow: `${ICON_BASE}Agreement.svg`,
  nda: `${ICON_BASE}Shield.svg`,
  msa: `${ICON_BASE}Legal.svg`,
  amendment: `${ICON_BASE}Configuration.svg`,
};

type Fields = Record<string, string>;
type Counts = Record<string, number>;

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const draftId = params.get("draft");

  const [phase, setPhase] = useState<Phase>("doctype");
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [fields, setFields] = useState<Fields>({});
  const [counts, setCounts] = useState<Counts>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const idRef = useRef<string>(draftId || newId());

  const [q1, setQ1] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId) return;
    const d = getDraft(draftId);
    if (d) {
      setTemplateId(d.templateId);
      setDocType(documentTypeOf(d.templateId));
      setFields(d.fields);
      setCounts(d.repeatCounts || {});
      setPhase("details");
    }
  }, [draftId]);

  useEffect(() => {
    if (!templateId || draftId) return;
    setFields((prev) => {
      const next = { ...prev };
      for (const g of TEMPLATE_SCHEMAS[templateId].groups) {
        if (g.kind === "scalar") {
          for (const f of g.fields) {
            if (f.default !== undefined && next[f.key] === undefined) next[f.key] = String(f.default);
          }
        }
      }
      if (next.MS_LEGAL_ENTITY && !next.MS_ADDRESS)
        next.MS_ADDRESS = MS_ADDRESS_BY_ENTITY[next.MS_LEGAL_ENTITY] ?? "";
      return next;
    });
    setCounts((prev) => {
      const next = { ...prev };
      for (const g of TEMPLATE_SCHEMAS[templateId].groups) {
        if (g.kind === "repeat" && next[g.title] === undefined) next[g.title] = g.minItems;
      }
      return next;
    });
  }, [templateId, draftId]);

  const showToast = useCallback((msg: string, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    if (!templateId || phase !== "details") return;
    const t = setTimeout(() => {
      const draft: Draft = {
        id: idRef.current,
        templateId,
        fields,
        repeatCounts: counts,
        updatedAt: new Date().toISOString(),
      };
      saveDraft(draft);
    }, 600);
    return () => clearTimeout(t);
  }, [fields, counts, templateId, phase]);

  function setField(key: string, value: string) {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "MS_LEGAL_ENTITY") {
        const auto = MS_ADDRESS_BY_ENTITY[value];
        if (auto && (!prev.MS_ADDRESS || Object.values(MS_ADDRESS_BY_ENTITY).includes(prev.MS_ADDRESS)))
          next.MS_ADDRESS = auto;
      }
      return next;
    });
    setErrors((e) => {
      if (!e[key]) return e;
      const { [key]: _drop, ...rest } = e;
      return rest;
    });
  }

  function pickDocType(d: DocumentType) {
    setDocType(d);
    const meta = DOCUMENT_TYPE_META[d];
    if (meta.templateId) {
      setTemplateId(meta.templateId);
      setPhase("details");
    } else {
      setTemplateId(null);
      setPhase("model");
    }
  }

  function pickServiceModel(m: ServiceModel) {
    setTemplateId(m);
  }

  function backFromDetails() {
    if (docType === "sow") setPhase("model");
    else {
      setPhase("doctype");
      setTemplateId(null);
    }
  }

  const buildPayload = useCallback((): Fields => {
    if (!templateId) return {};
    const out: Fields = {};
    for (const g of TEMPLATE_SCHEMAS[templateId].groups) {
      if (g.kind === "scalar") {
        for (const f of g.fields) out[f.key] = fields[f.key] ?? "";
      } else {
        const n = counts[g.title] ?? g.minItems;
        for (let i = 1; i <= n; i++)
          for (const f of g.fields) out[`${f.base}_${i}`] = fields[`${f.base}_${i}`] ?? "";
      }
    }
    return out;
  }, [templateId, fields, counts]);

  function validate(): boolean {
    if (!templateId) return false;
    const e: Record<string, string> = {};
    for (const g of TEMPLATE_SCHEMAS[templateId].groups) {
      if (g.kind !== "scalar") continue;
      for (const f of g.fields) {
        const v = (fields[f.key] ?? "").trim();
        if (f.required && !v) e[f.key] = "Required";
        else if (v && f.pattern && !new RegExp(f.pattern).test(v)) e[f.key] = "Invalid format";
      }
    }
    if (fields.EFFECTIVE_DATE && fields.END_DATE && new Date(fields.END_DATE) <= new Date(fields.EFFECTIVE_DATE))
      e.END_DATE = "Must be after the effective date";
    if (
      fields.EFFECTIVE_DATE &&
      fields.EXPIRATION_DATE &&
      new Date(fields.EXPIRATION_DATE) <= new Date(fields.EFFECTIVE_DATE)
    )
      e.EXPIRATION_DATE = "Must be after the effective date";
    if (templateId === "fixed_fee") {
      const sum =
        Number(fields.PAYMENT_MILESTONE_1_PERCENT || 0) +
        Number(fields.PAYMENT_MILESTONE_2_PERCENT || 0) +
        Number(fields.PAYMENT_MILESTONE_3_PERCENT || 0);
      if (sum !== 100) e.PAYMENT_MILESTONE_1_PERCENT = `Milestones must sum to 100 (now ${sum})`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function generate() {
    if (!templateId) return;
    if (!validate()) {
      showToast("Please fix the highlighted fields", true);
      return;
    }
    const userEmail = getUser() || "";
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, userEmail, fields: buildPayload() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const issues: { message: string }[] | undefined = data.issues;
        const msg = issues?.length
          ? `${data.error}: ${issues[0].message}`
          : data.error || `Generation failed (${res.status})`;
        showToast(msg, true);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("content-disposition") || "";
      const m = cd.match(/filename="([^"]+)"/);
      const fileName = m?.[1] || `${templateId}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Document generated and downloaded");
    } catch {
      showToast("Network error while generating", true);
    } finally {
      setBusy(false);
    }
  }

  const steps = useMemo<{ key: Phase; label: string }[]>(() => {
    const base: { key: Phase; label: string }[] = [{ key: "doctype", label: "Document type" }];
    if (docType === "sow") base.push({ key: "model", label: "Service model" });
    base.push({ key: "details", label: "Details" });
    return base;
  }, [docType]);

  return (
    <div className="fade-in">
      <Stepper steps={steps} active={phase} />

      {phase === "doctype" && <ChooseDocType active={docType} onPick={pickDocType} />}

      {phase === "model" && (
        <ChooseModel
          model={
            templateId && SERVICE_MODELS.includes(templateId as ServiceModel)
              ? (templateId as ServiceModel)
              : null
          }
          q1={q1}
          setQ1={setQ1}
          onPick={pickServiceModel}
          onBack={() => setPhase("doctype")}
          onNext={() => templateId && setPhase("details")}
        />
      )}

      {phase === "details" && templateId && (
        <DetailsStep
          templateId={templateId}
          fields={fields}
          counts={counts}
          errors={errors}
          setField={setField}
          setCounts={setCounts}
          onBack={backFromDetails}
          onGenerate={generate}
          busy={busy}
        />
      )}

      {toast && <div className={`toast ${toast.err ? "err" : ""}`}>{toast.msg}</div>}
    </div>
  );
}

function Stepper({ steps, active }: { steps: { key: Phase; label: string }[]; active: Phase }) {
  const idx = steps.findIndex((s) => s.key === active);
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.key} className={`step ${i === idx ? "active" : ""} ${i < idx ? "done" : ""}`}>
          <span className="dot">{i + 1}</span>
          {s.label}
          {i < steps.length - 1 && <span className="bar" />}
        </div>
      ))}
    </div>
  );
}

function ChooseDocType({
  active,
  onPick,
}: {
  active: DocumentType | null;
  onPick: (d: DocumentType) => void;
}) {
  return (
    <section className="card card-pad-lg">
      <div className="gradient-rule" />
      <div className="eyebrow">Step 1</div>
      <h2 style={{ font: "var(--h2)", letterSpacing: "var(--ls-tight)", margin: "8px 0 8px" }}>
        What type of document do you need?
      </h2>
      <p className="muted" style={{ marginBottom: "var(--space-6)", maxWidth: 560 }}>
        Each option uses a canonical, legal-approved template. Pick the one that matches the
        agreement you're preparing.
      </p>
      <div className="grid cols-2">
        {DOCUMENT_TYPES.map((d) => {
          const meta = DOCUMENT_TYPE_META[d];
          return (
            <button
              key={d}
              type="button"
              className={`option-card ${active === d ? "selected" : ""}`}
              onClick={() => onPick(d)}
            >
              <img className="oc-icon" src={DOCTYPE_ICON[d]} alt="" />
              <h4>{meta.name}</h4>
              <p>{meta.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ChooseModel({
  model,
  q1,
  setQ1,
  onPick,
  onBack,
  onNext,
}: {
  model: ServiceModel | null;
  q1: string | null;
  setQ1: (v: string) => void;
  onPick: (m: ServiceModel) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="grid" style={{ gap: "var(--space-6)" }}>
      <section className="card card-pad-lg">
        <div className="eyebrow">Guided questionnaire</div>
        <h2 style={{ font: "var(--h3)", letterSpacing: "var(--ls-snug)", margin: "8px 0 var(--space-5)" }}>
          Which SOW model fits this engagement?
        </h2>

        <p style={{ font: "600 14px/1.4 var(--font-sans)", marginBottom: "var(--space-3)" }}>
          Is the full project scope defined and committed up front?
        </p>
        <div className="row wrap" style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <button
            className={`btn sm ${q1 === "yes" ? "" : "ghost"}`}
            onClick={() => {
              setQ1("yes");
              onPick("fixed_fee");
            }}
          >
            Yes, fixed scope
          </button>
          <button className={`btn sm ${q1 === "no" ? "dark" : "ghost"}`} onClick={() => setQ1("no")}>
            No, ongoing
          </button>
        </div>

        {q1 === "no" && (
          <div className="fade-in">
            <p style={{ font: "600 14px/1.4 var(--font-sans)", marginBottom: "var(--space-3)" }}>
              How is the engagement billed?
            </p>
            <div className="row wrap" style={{ gap: "var(--space-3)" }}>
              <button
                className={`btn sm ${model === "monthly_team" ? "" : "ghost"}`}
                onClick={() => onPick("monthly_team")}
              >
                Dedicated team, flat monthly
              </button>
              <button
                className={`btn sm ${model === "monthly_individual" ? "" : "ghost"}`}
                onClick={() => onPick("monthly_individual")}
              >
                Named individuals, monthly
              </button>
              <button
                className={`btn sm ${model === "tm" ? "" : "ghost"}`}
                onClick={() => onPick("tm")}
              >
                Hourly by time worked
              </button>
              <button
                className={`btn sm ${model === "ai_pod" ? "" : "ghost"}`}
                onClick={() => onPick("ai_pod")}
              >
                Human plus AI pod
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
          Or pick a model directly:
        </p>
        <div className="grid cols-3">
          {SERVICE_MODELS.map((m) => {
            const s = TEMPLATE_SCHEMAS[m];
            return (
              <button
                key={m}
                type="button"
                className={`option-card ${model === m ? "selected" : ""}`}
                onClick={() => onPick(m)}
              >
                <img className="oc-icon" src={TEMPLATE_ICON[m]} alt="" />
                <h4>{s.name}</h4>
                <p>{s.tagline}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="row between">
        <button className="btn ghost" onClick={onBack}>Back</button>
        <button className="btn" disabled={!model} onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

function DetailsStep({
  templateId,
  fields,
  counts,
  errors,
  setField,
  setCounts,
  onBack,
  onGenerate,
  busy,
}: {
  templateId: TemplateId;
  fields: Fields;
  counts: Counts;
  errors: Record<string, string>;
  setField: (k: string, v: string) => void;
  setCounts: React.Dispatch<React.SetStateAction<Counts>>;
  onBack: () => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  const schema = TEMPLATE_SCHEMAS[templateId];
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)",
        gap: "var(--space-6)",
        alignItems: "start",
      }}
    >
      <div className="grid" style={{ gap: "var(--space-5)" }}>
        <div className="card card-pad row" style={{ gap: "var(--space-4)" }}>
          <img
            src={TEMPLATE_ICON[templateId]}
            alt=""
            style={{ width: 44, height: "auto", objectFit: "contain" }}
          />
          <div>
            <h3>{schema.name}</h3>
            <p className="muted" style={{ font: "var(--body-sm)", marginTop: 2 }}>
              {schema.tagline}
            </p>
          </div>
        </div>

        {schema.groups.map((g) =>
          g.kind === "scalar" ? (
            <section className="card card-pad" key={g.title}>
              <h4 style={{ marginBottom: "var(--space-5)" }}>{g.title}</h4>
              <div className="grid cols-2">
                {g.fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    f={f}
                    value={fields[f.key] ?? ""}
                    error={errors[f.key]}
                    onChange={setField}
                  />
                ))}
              </div>
            </section>
          ) : (
            <RepeatSection
              key={g.title}
              group={g}
              count={counts[g.title] ?? g.minItems}
              fields={fields}
              setField={setField}
              setCount={(n) => setCounts((c) => ({ ...c, [g.title]: n }))}
            />
          ),
        )}

        <div className="row between">
          <button className="btn ghost" onClick={onBack}>Back</button>
          <button className="btn lg" onClick={onGenerate} disabled={busy}>
            {busy ? "Generating…" : "Generate document"}
          </button>
        </div>
      </div>

      <Preview templateId={templateId} fields={fields} counts={counts} />
    </div>
  );
}

function FieldInput({
  f,
  value,
  error,
  onChange,
}: {
  f: FieldDef;
  value: string;
  error?: string;
  onChange: (k: string, v: string) => void;
}) {
  const big = f.type === "textarea";
  return (
    <div className="field" style={{ gridColumn: big ? "1 / -1" : undefined }}>
      <label htmlFor={f.key}>
        {f.label} {f.required && <span className="req">*</span>}
      </label>
      {f.type === "select" ? (
        <select
          id={f.key}
          name={f.key}
          className={error ? "invalid" : ""}
          value={value}
          onChange={(e) => onChange(f.key, e.target.value)}
        >
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : f.type === "textarea" ? (
        <textarea
          id={f.key}
          name={f.key}
          className={error ? "invalid" : ""}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) => onChange(f.key, e.target.value)}
        />
      ) : (
        <input
          id={f.key}
          name={f.key}
          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
          className={error ? "invalid" : ""}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) => onChange(f.key, e.target.value)}
        />
      )}
      {error ? <span className="err">{error}</span> : f.help ? <span className="help">{f.help}</span> : null}
    </div>
  );
}

function RepeatSection({
  group,
  count,
  fields,
  setField,
  setCount,
}: {
  group: RepeatGroup;
  count: number;
  fields: Fields;
  setField: (k: string, v: string) => void;
  setCount: (n: number) => void;
}) {
  return (
    <section className="card card-pad">
      <div className="row between" style={{ marginBottom: "var(--space-4)" }}>
        <h4>{group.title}</h4>
        <span className="faint" style={{ font: "var(--body-sm)" }}>
          {count} of {group.maxItems} {group.itemNoun.toLowerCase()}s
        </span>
      </div>
      <div className="grid" style={{ gap: "var(--space-3)" }}>
        {Array.from({ length: count }, (_, idx) => {
          const i = idx + 1;
          return (
            <div className="repeat-item" key={i}>
              {count > group.minItems && (
                <button className="btn danger-link rm sm" onClick={() => setCount(count - 1)}>
                  Remove
                </button>
              )}
              <div
                className="faint"
                style={{
                  font: "700 11px/1 var(--font-sans)",
                  letterSpacing: "var(--ls-eyebrow)",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-3)",
                }}
              >
                {group.itemNoun} {i}
              </div>
              <div className="grid cols-2">
                {group.fields.map((bf) => {
                  const key = `${bf.base}_${i}`;
                  return (
                    <FieldInput
                      key={key}
                      f={{ key, label: bf.label, type: bf.type, help: bf.help }}
                      value={fields[key] ?? ""}
                      onChange={setField}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {count < group.maxItems && (
        <button
          className="btn ghost sm"
          style={{ marginTop: "var(--space-4)" }}
          onClick={() => setCount(count + 1)}
        >
          Add {group.itemNoun.toLowerCase()}
        </button>
      )}
    </section>
  );
}

function Preview({
  templateId,
  fields,
  counts,
}: {
  templateId: TemplateId;
  fields: Fields;
  counts: Counts;
}) {
  const lines = useMemo(() => {
    const l: [string, string][] = [];
    if (templateId === "nda") {
      l.push(["Client", fields.CLIENT_LEGAL_NAME || "—"]);
      l.push(["Address", fields.CLIENT_ADDRESS || "—"]);
      l.push(["Effective", fields.EFFECTIVE_DATE || "—"]);
    } else if (templateId === "msa") {
      l.push(["Client", fields.CLIENT_LEGAL_NAME || "—"]);
      l.push(["Entity type", fields.CLIENT_ENTITY_TYPE || "—"]);
      l.push(["Jurisdiction", fields.CLIENT_ORGANIZED_IN || "—"]);
      l.push(["Term", `${fields.EFFECTIVE_DATE || "?"} to ${fields.EXPIRATION_DATE || "?"}`]);
      l.push(["Contact", fields.CLIENT_CONTACT_NAME || "—"]);
    } else if (templateId === "amendment") {
      l.push(["Amends", fields.SOW_REFERENCE || "—"]);
      l.push(["Amendment #", fields.AMENDMENT_NUMBER || "—"]);
      l.push(["Client", fields.CLIENT_LEGAL_NAME || "—"]);
      l.push(["Effective", fields.AMENDMENT_EFFECTIVE_DATE || "—"]);
      const changes =
        (fields.ITEM_1_SECTION_REFERENCE ? 1 : 0) + (fields.ITEM_2_SECTION_REFERENCE ? 1 : 0);
      l.push(["Changes", String(changes)]);
    } else {
      l.push(["SOW number", fields.SOW_NUMBER || "—"]);
      l.push(["Project", fields.PROJECT_NAME || "—"]);
      l.push(["Client", fields.CLIENT_LEGAL_NAME || "—"]);
      l.push(["MS entity", fields.MS_LEGAL_ENTITY || "—"]);
      l.push(["Term", `${fields.EFFECTIVE_DATE || "?"} to ${fields.END_DATE || "?"}`]);
      if (templateId === "fixed_fee")
        l.push([
          "Payment split",
          `${fields.PAYMENT_MILESTONE_1_PERCENT || 0}/${fields.PAYMENT_MILESTONE_2_PERCENT || 0}/${fields.PAYMENT_MILESTONE_3_PERCENT || 0}%`,
        ]);
      if (templateId === "ai_pod") {
        l.push(["Pod", fields.POD_NAME || "—"]);
        l.push(["Humans", fields.POD_HUMAN_COUNT || "—"]);
      }
      if (templateId === "monthly_team") l.push(["Team size", String(counts["Team Composition"] ?? 1)]);
      if (templateId === "monthly_individual")
        l.push(["Roles", String(counts["Roles & Monthly Rates"] ?? 1)]);
      if (templateId === "tm") l.push(["Rate card rows", String(counts["Rate Card"] ?? 1)]);
    }
    return l;
  }, [templateId, fields, counts]);

  return (
    <aside className="card card-pad" style={{ position: "sticky", top: 96 }}>
      <div className="gradient-rule" />
      <div className="eyebrow">Live preview</div>
      <h3 style={{ margin: "8px 0 var(--space-4)", font: "var(--h4)" }}>
        {TEMPLATE_SCHEMAS[templateId].name}
      </h3>
      <div>
        {lines.map(([k, v]) => (
          <div className="preview-line" key={k}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </div>
      <p className="faint" style={{ font: "var(--caption)", marginTop: "var(--space-4)" }}>
        The generated .docx uses the canonical, legal-approved template — formatting, fonts, and
        clauses are preserved exactly.
      </p>
    </aside>
  );
}
