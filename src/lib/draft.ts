"use client";

import type { TemplateId } from "./schema";

const AUTH_KEY = "ms_sow_user";
const DRAFT_PREFIX = "ms_sow_draft:";

export function getUser(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_KEY);
}

export function setUser(email: string) {
  window.localStorage.setItem(AUTH_KEY, email);
}

export function clearUser() {
  window.localStorage.removeItem(AUTH_KEY);
}

export interface Draft {
  id: string;
  templateId: TemplateId;
  fields: Record<string, string>;
  repeatCounts: Record<string, number>;
  updatedAt: string;
}

export function listDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  const out: Draft[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(DRAFT_PREFIX)) {
      try {
        out.push(JSON.parse(window.localStorage.getItem(k)!));
      } catch {
        /* ignore corrupt draft */
      }
    }
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveDraft(draft: Draft) {
  window.localStorage.setItem(DRAFT_PREFIX + draft.id, JSON.stringify(draft));
}

export function getDraft(id: string): Draft | null {
  const raw = window.localStorage.getItem(DRAFT_PREFIX + id);
  return raw ? JSON.parse(raw) : null;
}

export function deleteDraft(id: string) {
  window.localStorage.removeItem(DRAFT_PREFIX + id);
}
