/**
 * Shared Chromium launch options for serverless (Vercel/Lambda).
 * Sets LD_LIBRARY_PATH so the Chromium binary can find libnss3.so and other
 * shared libraries in the extraction directory. Fixes:
 * "error while loading shared libraries: libnss3.so: cannot open shared object file"
 */
import path from "path";
import chromium from "@sparticuz/chromium";

export async function getChromiumLaunchOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    return { executablePath: undefined, args: [] };
  }
  // So @sparticuz/chromium picks the right binary (set in Vercel Dashboard for best results)
  if (process.env.VERCEL && !process.env.AWS_LAMBDA_JS_RUNTIME) {
    process.env.AWS_LAMBDA_JS_RUNTIME = "nodejs22.x";
  }
  if (typeof chromium.setGraphicsMode === "function") {
    chromium.setGraphicsMode(false);
  }
  const executablePath = await chromium.executablePath();
  process.env.LD_LIBRARY_PATH = path.dirname(executablePath);
  return { executablePath, args: chromium.args };
}
