/**
 * Slug Utilities for Global Markets
 */

/**
 * Sanitizes a slug by removing India/US specific market suffixes.
 * This ensures that cross-domain pages don't signal duplicate content to Google.
 * 
 * @param {string} slug - The raw slug (e.g., 'software-engineer-resume-india' or 'chef-resume-usa')
 * @returns {string} - The sanitized slug (e.g., 'software-engineer' or 'chef')
 */
export function sanitizeGlobalSlug(slug) {
    if (!slug) return "";

    return slug
        .replace(/-resume-india$/i, "")
        .replace(/-india-resume$/i, "")
        .replace(/-resume-ind$/i, "")
        .replace(/-ind-resume$/i, "")
        .replace(/-resume-usa$/i, "")
        .replace(/-usa$/i, "")
        .replace(/-india$/i, "");
}
