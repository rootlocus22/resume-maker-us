export const COMMON_FORMATS = [
  'MM-yyyy', 'MMM yyyy', 'MMMM yyyy', 'MM/yyyy', 'yyyy-MM', 'yyyy/MM', 'yyyy', 'yyyy/MM/dd', 'yyyy-MM-dd'
];

import { parse, format } from 'date-fns';

// Parse various date formats robustly
export function tryParseDate(date, formatStrs = COMMON_FORMATS) {
  if (!date) return null;
  if (date instanceof Date && !isNaN(date)) return date;
  for (const fmt of formatStrs) {
    try {
      const parsed = parse(date, fmt, new Date());
      if (parsed instanceof Date && !isNaN(parsed)) return parsed;
    } catch { }
  }
  try {
    const fallback = new Date(date);
    if (fallback instanceof Date && !isNaN(fallback)) return fallback;
  } catch { }
  return null;
}

// Format a date according to user preferences
export function formatDateWithPreferences(date, preferences, defaultFmt = 'MMM yyyy') {
  if (!date) return '';
  const userFmt = preferences?.dateFormat?.format || defaultFmt;
  const dateObj = tryParseDate(date, [userFmt, ...COMMON_FORMATS]);
  if (!dateObj) return '';
  try {
    return format(dateObj, userFmt);
  } catch {
    return '';
  }
}

// Clean text helper (strip trailing whitespace, normalise)
export function cleanText(text = '', fieldType = 'text') {
  if (!text) return '';

  // Ensure text is a string before calling replace
  const textStr = typeof text === 'string' ? text : String(text);

  if (fieldType === 'numeric') return textStr.toString().trim();
  return textStr.replace(/\s+/g, ' ').trim();
}

// Helper function to normalize phone numbers for comparison
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return "";
  return phone.replace(/\D/g, '');
}

// Check if resume is for someone else (Client-Side Logic)
export function checkIfResumeIsForSomeoneElseLocal(userProfile, resumeData) {
  if (!userProfile || !resumeData) return false;

  // Allow John Doe
  const nameCheck = String(resumeData.name || "").trim().toLowerCase();
  if (nameCheck === "john doe" || nameCheck === "johndoe") return false;

  // LIGHT CHECK: Only check name (exact match, case-insensitive)
  const resumeName = (resumeData.name?.trim()?.toLowerCase() || "");
  
  // If resume name is empty, we can't verify, so be permissive
  if (!resumeName) return false;

  // Handle array of references (multiple profile slots)
  const references = Array.isArray(userProfile) ? userProfile : [userProfile];
  
  // Check if ANY reference name matches (exact match)
  const nameMatch = references.some(ref => {
    const refName = (ref.name?.trim()?.toLowerCase() || "");
    return refName && resumeName && refName === resumeName;
  });

  // If name matches, it's NOT for someone else
  if (nameMatch) return false;

  // No match found - is for someone else
  return true;
} 