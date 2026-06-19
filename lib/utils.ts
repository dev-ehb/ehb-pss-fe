import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SqLevel, SqStatus, AuditAction } from '@/types/pss.types';

// ── Tailwind merge utility ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── SQ Level colors ───────────────────────────────────────────────────────────

const SQ_LEVEL_COLORS: Record<number, string> = {
  1: 'bg-gray-300 text-gray-800',
  2: 'bg-orange-200 text-orange-900',
  3: 'bg-amber-200 text-amber-900',
  4: 'bg-slate-300 text-slate-800',
  5: 'bg-yellow-400 text-yellow-900',
  6: 'bg-cyan-200 text-cyan-900',
  7: 'bg-blue-400 text-white',
  8: 'bg-sky-500 text-white',
  9: 'bg-gray-900 text-white',
  10: 'bg-purple-600 text-white',
};

export function getSqLevelColor(level: SqLevel | number | null): string {
  if (level === null || level === undefined) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  return SQ_LEVEL_COLORS[level] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

const SQ_LEVEL_NAMES: Record<number, string> = {
  1: 'Iron',
  2: 'Bronze',
  3: 'Copper',
  4: 'Silver',
  5: 'Gold',
  6: 'Platinum',
  7: 'Titanium',
  8: 'Diamond',
  9: 'Obsidian',
  10: 'Mythic',
};

/** Bare level name, e.g. 5 → 'Gold' */
export function getSqLevelName(level: SqLevel | number | null): string {
  if (level === null || level === undefined) return 'Unscored';
  return SQ_LEVEL_NAMES[level] ?? `SQ${level}`;
}

/** Badge display string in "SQ{n} · {Name}" format, e.g. 5 → 'SQ5 · Gold' */
export function getSqLevelDisplay(level: SqLevel | number | null): string {
  if (level === null || level === undefined) return '—';
  const name = SQ_LEVEL_NAMES[level];
  return name ? `SQ${level} · ${name}` : `SQ${level}`;
}

export function getSqLevelLabel(level: SqLevel | number | null): string {
  if (level === null || level === undefined) return 'Unscored';
  return getSqLevelDisplay(level);
}

// ── SQ Status colors ──────────────────────────────────────────────────────────

export function getSqStatusColor(status: SqStatus | string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    pending_franchise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    pending_edr: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    conditional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function getSqStatusLabel(status: SqStatus | string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    pending_franchise: 'Franchise Review',
    pending_edr: 'EDR Review',
    approved: 'Approved',
    conditional: 'Conditional',
    rejected: 'Rejected',
  };
  return map[status] ?? status;
}

// ── Audit action badge colors ─────────────────────────────────────────────────

export function getAuditActionColor(action: AuditAction | string): string {
  if (action === 'sq_submitted') return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  if (action === 'sq_auto_approved') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if (action === 'sq_rule_rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (action.startsWith('sq_forwarded')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
  if (action === 'no_rule_matched') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
  if (action === 'rule_engine_error') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (action.startsWith('franchise')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  if (action.startsWith('edr')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
  if (action.startsWith('webhook')) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

// ── Truncate string ───────────────────────────────────────────────────────────

export function truncate(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

// ── Object to key-value display pairs ────────────────────────────────────────

export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      result.push(...flattenObject(v as Record<string, unknown>, key));
    } else if (Array.isArray(v)) {
      result.push({ key, value: v.join(', ') });
    } else {
      result.push({ key, value: String(v ?? '—') });
    }
  }
  return result;
}
