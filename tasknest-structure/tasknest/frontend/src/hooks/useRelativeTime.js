import { useState, useEffect, useCallback } from 'react';

/**
 * Converts an ISO-8601 timestamp string (always treated as UTC) to a
 * human-friendly relative label that automatically ticks every 30 seconds.
 *
 * The backend emits strings like "2026-08-05T14:32:00+00:00".
 * If the string has no timezone suffix, we append "Z" so Date() parses it as UTC.
 *
 * Examples: "Just now" | "1 minute ago" | "15 minutes ago" |
 *            "2 hours ago" | "Yesterday" | "3 days ago"
 */

export function formatRelativeTime(isoString) {
  if (!isoString) return '';

  // Ensure the string is treated as UTC.
  // Strings from the backend already have "+00:00", but guard against bare strings.
  const normalized =
    isoString.endsWith('Z') ||
    isoString.includes('+') ||
    (isoString.includes('T') && isoString.length > 19)
      ? isoString
      : isoString + 'Z';

  const date = new Date(normalized);
  if (isNaN(date.getTime())) return isoString; // fallback: return raw

  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 5)   return 'Just now';
  if (diffSec < 60)  return `${diffSec} seconds ago`;
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60)  return `${diffMin} minutes ago`;
  if (diffHr === 1)  return '1 hour ago';
  if (diffHr < 24)   return `${diffHr} hours ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7)   return `${diffDay} days ago`;
  if (diffDay < 30)  return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`;
  return `${Math.floor(diffDay / 365)} years ago`;
}

/**
 * Returns a reactive relative-time string for a single timestamp.
 * Re-evaluates on a 30-second interval so the label stays accurate.
 */
export function useRelativeTime(isoString) {
  const compute = useCallback(() => formatRelativeTime(isoString), [isoString]);
  const [label, setLabel] = useState(compute);

  useEffect(() => {
    setLabel(compute());
    const id = setInterval(() => setLabel(compute()), 30_000);
    return () => clearInterval(id);
  }, [compute]);

  return label;
}

/**
 * Formats an ISO string as a full local datetime for tooltip display.
 * e.g. "Wednesday, August 5, 2026, 8:32:00 PM"
 */
export function formatExactTime(isoString) {
  if (!isoString) return '';
  const normalized =
    isoString.endsWith('Z') || isoString.includes('+')
      ? isoString
      : isoString + 'Z';
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
