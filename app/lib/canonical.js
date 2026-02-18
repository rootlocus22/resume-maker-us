import { headers } from "next/headers";
import { BASE_URL } from "./appConfig";

/**
 * Build canonical URL from the request host so it matches the crawled URL.
 * Fixes GSC "Duplicate without user-selected canonical" when the site is
 * served as www but BASE_URL is non-www (or vice versa).
 * @param {string} path - Path including leading slash (e.g. "/resume-guide/my-slug")
 * @returns {Promise<string>} Full canonical URL (e.g. https://www.expertresume.us/resume-guide/my-slug)
 */
export async function getCanonicalUrl(path) {
  // Always use the hardcoded BASE_URL to avoid "Duplicate without user-selected canonical"
  // This ensures Google only indexes ONE version (the one defined in appConfig.js).
  return `${BASE_URL}${path}`;
}
