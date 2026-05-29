export type ServiceModel =
  | "fixed_fee"
  | "monthly_team"
  | "monthly_individual"
  | "tm"
  | "ai_pod";

export type AuxDoc = "nda" | "msa" | "amendment";
export type TemplateId = ServiceModel | AuxDoc;
export type DocumentType = "sow" | AuxDoc;

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  default?: string | number;
  options?: string[];
  pattern?: string;
  placeholder?: string;
}

export interface RepeatGroup {
  kind: "repeat";
  title: string;
  itemNoun: string;
  minItems: number;
  maxItems: number;
  fields: { base: string; label: string; type: FieldType; help?: string }[];
}

export interface ScalarGroup {
  kind: "scalar";
  title: string;
  fields: FieldDef[];
}

export type FormGroup = ScalarGroup | RepeatGroup;

export const MS_ENTITIES = ["Making Sense LLC", "Making Sense S.A."] as const;

export const MS_ADDRESS_BY_ENTITY: Record<string, string> = {
  "Making Sense LLC": "200 SE 1st Street, Suite 601, Miami, FL 33131, USA",
  "Making Sense S.A.": "Av. Corrientes 800, Piso 9, C1043AAU, Buenos Aires, Argentina",
};

// ----- shared field fragments -----

const sowIdentityGroup: ScalarGroup = {
  kind: "scalar",
  title: "Identity & Project",
  fields: [
    {
      key: "SOW_NUMBER",
      label: "SOW Number",
      type: "text",
      required: true,
      pattern: "^SOW-\\d{4}-\\d{3}$",
      placeholder: "SOW-2026-001",
      help: "Format: SOW-YYYY-NNN",
    },
    { key: "PROJECT_NAME", label: "Project Name", type: "text", required: true },
    { key: "EFFECTIVE_DATE", label: "Effective Date", type: "date", required: true },
    {
      key: "END_DATE",
      label: "Project End Date",
      type: "date",
      required: true,
      help: "Must be after the Effective Date",
    },
    { key: "CLIENT_LEGAL_NAME", label: "Client Legal Name", type: "text", required: true },
    { key: "CLIENT_ADDRESS", label: "Client Address", type: "text", required: true },
    {
      key: "MS_LEGAL_ENTITY",
      label: "Making Sense Entity",
      type: "select",
      required: true,
      options: [...MS_ENTITIES],
      default: "Making Sense LLC",
    },
    {
      key: "MS_ADDRESS",
      label: "Making Sense Address",
      type: "text",
      required: true,
      help: "Auto-filled from the selected entity; editable",
    },
    { key: "MSA_DATE", label: "MSA Date", type: "date", required: true },
  ],
};

const currencyField: FieldDef = {
  key: "CURRENCY",
  label: "Currency",
  type: "select",
  options: ["USD", "EUR", "ARS"],
  default: "USD",
  required: true,
};

const fixedFeePayment: ScalarGroup = {
  kind: "scalar",
  title: "Payment Schedule",
  fields: [
    {
      key: "PAYMENT_MILESTONE_1_PERCENT",
      label: "Milestone 1 %",
      type: "number",
      required: true,
      default: 30,
      help: "Due on execution",
    },
    {
      key: "PAYMENT_MILESTONE_2_PERCENT",
      label: "Milestone 2 %",
      type: "number",
      required: true,
      default: 40,
    },
    {
      key: "PAYMENT_MILESTONE_2_TRIGGER",
      label: "Milestone 2 Trigger",
      type: "text",
      required: true,
      placeholder: "UAT delivery",
    },
    {
      key: "PAYMENT_MILESTONE_3_PERCENT",
      label: "Milestone 3 %",
      type: "number",
      required: true,
      default: 30,
      help: "Due on final acceptance. The three percentages must sum to 100.",
    },
  ],
};

const fixedFeeExhibit: ScalarGroup = {
  kind: "scalar",
  title: "Exhibit I — Scope & Deliverables",
  fields: [
    { key: "OBJECTIVE_1", label: "Objective 1", type: "textarea", required: true },
    { key: "OBJECTIVE_2", label: "Objective 2", type: "textarea" },
    { key: "OBJECTIVE_3", label: "Objective 3", type: "textarea" },
    {
      key: "DELIVERABLE_1",
      label: "Deliverable 1",
      type: "textarea",
      required: true,
      help: "Description, depth, format, revision rounds",
    },
    { key: "DELIVERABLE_2", label: "Deliverable 2", type: "textarea" },
    { key: "DELIVERABLE_3", label: "Deliverable 3", type: "textarea" },
    { key: "CRITERIA_1", label: "Acceptance Criteria 1", type: "textarea", required: true },
    { key: "CRITERIA_2", label: "Acceptance Criteria 2", type: "textarea" },
    { key: "CRITERIA_3", label: "Acceptance Criteria 3", type: "textarea" },
    { key: "OUT_OF_SCOPE_1", label: "Out-of-Scope Item 1", type: "textarea", required: true },
    { key: "OUT_OF_SCOPE_2", label: "Out-of-Scope Item 2", type: "textarea" },
    { key: "OUT_OF_SCOPE_3", label: "Out-of-Scope Item 3", type: "textarea" },
    { key: "ASSUMPTION_CLIENT", label: "Assumption — CLIENT responsibilities", type: "textarea" },
    { key: "ASSUMPTION_DEPENDENCIES", label: "Assumption — Third-party dependencies", type: "textarea" },
    { key: "ASSUMPTION_ENVIRONMENT", label: "Assumption — Technical environment", type: "textarea" },
    {
      key: "ASSUMPTION_FEEDBACK",
      label: "Assumption — Feedback timeframes",
      type: "textarea",
      placeholder: "e.g., CLIENT feedback within 3 business days",
    },
    { key: "ASSUMPTION_ACCESS", label: "Assumption — Access & credentials", type: "textarea" },
    { key: "ASSUMPTION_REGULATORY", label: "Assumption — Regulatory / compliance", type: "textarea" },
    { key: "MILESTONE_1_DESC", label: "Milestone 1 Description", type: "text" },
    { key: "MILESTONE_1_DATE", label: "Milestone 1 Date", type: "date" },
    { key: "MILESTONE_2_DESC", label: "Milestone 2 Description", type: "text" },
    { key: "MILESTONE_2_DATE", label: "Milestone 2 Date", type: "date" },
    { key: "MILESTONE_3_DESC", label: "Milestone 3 Description", type: "text" },
    { key: "MILESTONE_3_DATE", label: "Milestone 3 Date", type: "date" },
    { key: "FINAL_DELIVERY_DATE", label: "Final Delivery Date", type: "date", required: true },
    { key: "RISK_1_DESC", label: "Risk 1", type: "text" },
    { key: "RISK_1_MITIGATION", label: "Risk 1 Mitigation", type: "text" },
    { key: "RISK_2_DESC", label: "Risk 2", type: "text" },
    { key: "RISK_2_MITIGATION", label: "Risk 2 Mitigation", type: "text" },
    { key: "RISK_3_DESC", label: "Risk 3", type: "text" },
    { key: "RISK_3_MITIGATION", label: "Risk 3 Mitigation", type: "text" },
  ],
};

// ----- auxiliary documents -----

const ndaGroup: ScalarGroup = {
  kind: "scalar",
  title: "Parties & Effective Date",
  fields: [
    { key: "CLIENT_LEGAL_NAME", label: "Client Legal Name", type: "text", required: true },
    { key: "CLIENT_ADDRESS", label: "Client Address", type: "text", required: true },
    { key: "EFFECTIVE_DATE", label: "Effective Date", type: "date", required: true },
  ],
};

const msaClientIdentity: ScalarGroup = {
  kind: "scalar",
  title: "Client Identity",
  fields: [
    { key: "CLIENT_LEGAL_NAME", label: "Client Legal Name", type: "text", required: true },
    {
      key: "CLIENT_ENTITY_TYPE",
      label: "Entity Type",
      type: "text",
      required: true,
      placeholder: "corporation / LLC / S.A. / S.R.L.",
    },
    {
      key: "CLIENT_ORGANIZED_IN",
      label: "Organized In",
      type: "text",
      required: true,
      placeholder: "Delaware, USA",
      help: "Jurisdiction of incorporation",
    },
    { key: "CLIENT_ADDRESS", label: "Principal Address", type: "text", required: true },
    {
      key: "CLIENT_NOTICE_ADDRESS",
      label: "Notice Address",
      type: "text",
      required: true,
      help: "Address for formal legal notices (may differ from principal address)",
    },
  ],
};

const msaContact: ScalarGroup = {
  kind: "scalar",
  title: "Client Contact",
  fields: [
    { key: "CLIENT_CONTACT_NAME", label: "Primary Contact Name", type: "text", required: true },
    { key: "CLIENT_CONTACT_PHONE", label: "Contact Phone", type: "text", required: true },
  ],
};

const msaTerm: ScalarGroup = {
  kind: "scalar",
  title: "Term",
  fields: [
    { key: "EFFECTIVE_DATE", label: "Effective Date", type: "date", required: true },
    {
      key: "EXPIRATION_DATE",
      label: "Expiration Date",
      type: "date",
      required: true,
      help: "Must be after the Effective Date",
    },
  ],
};

const amendmentReference: ScalarGroup = {
  kind: "scalar",
  title: "Amendment Reference",
  fields: [
    {
      key: "AMENDMENT_NUMBER",
      label: "Amendment Number",
      type: "text",
      required: true,
      placeholder: "1",
      help: "Sequential number of this amendment to the referenced SOW",
    },
    {
      key: "SOW_REFERENCE",
      label: "SOW Reference",
      type: "text",
      required: true,
      pattern: "^SOW-\\d{4}-\\d{3}$",
      placeholder: "SOW-2026-001",
      help: "The SOW being amended (format: SOW-YYYY-NNN)",
    },
    {
      key: "AMENDMENT_EFFECTIVE_DATE",
      label: "Amendment Effective Date",
      type: "date",
      required: true,
    },
  ],
};

const amendmentOriginalSow: ScalarGroup = {
  kind: "scalar",
  title: "Original SOW",
  fields: [
    { key: "CLIENT_LEGAL_NAME", label: "Client Legal Name", type: "text", required: true },
    { key: "MSA_DATE", label: "MSA Date", type: "date", required: true },
    { key: "SOW_EFFECTIVE_DATE", label: "Original SOW Effective Date", type: "date", required: true },
  ],
};

const amendmentChanges: ScalarGroup = {
  kind: "scalar",
  title: "Changes",
  fields: [
    {
      key: "ITEM_1_SECTION_REFERENCE",
      label: "Change 1 — Section Reference",
      type: "text",
      required: true,
      placeholder: "Section 6.1 (Fixed Fee)",
    },
    {
      key: "ITEM_1_NEW_TEXT",
      label: "Change 1 — New Text",
      type: "textarea",
      required: true,
      help: "Replacement text for the referenced section",
    },
    {
      key: "ITEM_2_SECTION_REFERENCE",
      label: "Change 2 — Section Reference",
      type: "text",
      placeholder: "Optional",
    },
    { key: "ITEM_2_NEW_TEXT", label: "Change 2 — New Text", type: "textarea" },
  ],
};

// ----- template schemas -----

export interface TemplateSchema {
  id: TemplateId;
  name: string;
  tagline: string;
  groups: FormGroup[];
}

export const TEMPLATE_SCHEMAS: Record<TemplateId, TemplateSchema> = {
  fixed_fee: {
    id: "fixed_fee",
    name: "Fixed Fee SOW",
    tagline: "Scope-committed: defined deliverables for a fixed price. Team is not disclosed.",
    groups: [sowIdentityGroup, fixedFeePayment, fixedFeeExhibit],
  },
  monthly_team: {
    id: "monthly_team",
    name: "Monthly Fee — Team",
    tagline: "A dedicated team billed at a flat monthly fee; roles disclosed without rates.",
    groups: [
      sowIdentityGroup,
      {
        kind: "repeat",
        title: "Team Composition",
        itemNoun: "Role",
        minItems: 1,
        maxItems: 3,
        fields: [
          { base: "ROLE", label: "Role", type: "text" },
          { base: "FTE", label: "FTE %", type: "number" },
          { base: "RESPONSIBILITIES", label: "Responsibilities", type: "textarea" },
        ],
      },
    ],
  },
  monthly_individual: {
    id: "monthly_individual",
    name: "Monthly Fee — Individual",
    tagline: "Named roles each billed at an individual monthly rate.",
    groups: [
      sowIdentityGroup,
      { kind: "scalar", title: "Financial", fields: [currencyField] },
      {
        kind: "repeat",
        title: "Roles & Monthly Rates",
        itemNoun: "Role",
        minItems: 1,
        maxItems: 5,
        fields: [
          { base: "ROLE", label: "Role", type: "text" },
          { base: "MONTHLY_RATE", label: "Monthly Rate", type: "number" },
          { base: "RESPONSIBILITIES", label: "Responsibilities", type: "textarea" },
        ],
      },
    ],
  },
  tm: {
    id: "tm",
    name: "Time & Materials",
    tagline: "Hourly/daily rates per role, billed against actual time worked.",
    groups: [
      sowIdentityGroup,
      { kind: "scalar", title: "Financial", fields: [currencyField] },
      {
        kind: "repeat",
        title: "Rate Card",
        itemNoun: "Role",
        minItems: 1,
        maxItems: 5,
        fields: [
          { base: "ROLE", label: "Role", type: "text" },
          { base: "STANDARD_RATE", label: "Standard Rate", type: "number" },
          { base: "DISCOUNTED_RATE", label: "Discounted Rate", type: "number" },
        ],
      },
    ],
  },
  ai_pod: {
    id: "ai_pod",
    name: "AI Pod",
    tagline: "A human + AI capability pod delivering against defined capabilities.",
    groups: [
      sowIdentityGroup,
      {
        kind: "scalar",
        title: "Pod Definition",
        fields: [
          { key: "POD_NAME", label: "Pod Name", type: "text", required: true },
          { key: "POD_HUMAN_COUNT", label: "Human Headcount", type: "number", required: true },
          { key: "POD_CAPABILITIES", label: "Pod Capabilities", type: "textarea", required: true },
          { key: "AI_TOOLS_USED", label: "AI Tools Used", type: "textarea", required: true },
        ],
      },
    ],
  },
  nda: {
    id: "nda",
    name: "Mutual NDA",
    tagline: "Reciprocal confidentiality, signed before any disclosure of business information.",
    groups: [ndaGroup],
  },
  msa: {
    id: "msa",
    name: "Master Services Agreement",
    tagline: "The framework agreement under which all future SOWs are issued.",
    groups: [msaClientIdentity, msaContact, msaTerm],
  },
  amendment: {
    id: "amendment",
    name: "Amendment to SOW",
    tagline: "Modifies an existing, signed SOW — scope, dates, fee, or other terms.",
    groups: [amendmentReference, amendmentOriginalSow, amendmentChanges],
  },
};

// ----- document type catalog (top-level wizard step) -----

export interface DocumentTypeMeta {
  id: DocumentType;
  name: string;
  description: string;
  /** When defined, picking this doc type goes straight to the details step with this templateId. */
  templateId?: TemplateId;
}

export const DOCUMENT_TYPE_META: Record<DocumentType, DocumentTypeMeta> = {
  sow: {
    id: "sow",
    name: "Statement of Work",
    description: "Defines the scope and fee model for a specific engagement. Requires an MSA in place.",
  },
  nda: {
    id: "nda",
    name: "Mutual NDA",
    description: "Reciprocal confidentiality. Signed before any business information is exchanged.",
    templateId: "nda",
  },
  msa: {
    id: "msa",
    name: "Master Services Agreement",
    description: "Framework agreement. All future SOWs are issued under an MSA.",
    templateId: "msa",
  },
  amendment: {
    id: "amendment",
    name: "Amendment to SOW",
    description: "Modifies an existing signed SOW (scope, dates, fee, etc.).",
    templateId: "amendment",
  },
};

export const DOCUMENT_TYPES: DocumentType[] = ["sow", "nda", "msa", "amendment"];

export const SERVICE_MODELS: ServiceModel[] = [
  "fixed_fee",
  "monthly_team",
  "monthly_individual",
  "tm",
  "ai_pod",
];

/** True when this template belongs to the SOW family. */
export function isServiceModel(t: TemplateId): t is ServiceModel {
  return SERVICE_MODELS.includes(t as ServiceModel);
}

export function documentTypeOf(t: TemplateId): DocumentType {
  return isServiceModel(t) ? "sow" : (t as DocumentType);
}
