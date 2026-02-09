/**
 * Shared Chromium launch options for serverless (Vercel/Lambda).
 * @sparticuz/chromium only sets LD_LIBRARY_PATH at module load time when
 * AWS_LAMBDA_JS_RUNTIME is 20.x/22.x. On Vercel that env isn't set by default,
 * so we set it and then dynamically import chromium so its setup runs correctly.
 */
import path from "path";

export async function getChromiumLaunchOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    return { executablePath: undefined, args: [], env: undefined };
  }
  // Must be set BEFORE @sparticuz/chromium is loaded so its top-level code
  // runs setupLambdaEnvironment("/tmp/al2023/lib") and sets LD_LIBRARY_PATH
  if (!process.env.AWS_LAMBDA_JS_RUNTIME) {
    process.env.AWS_LAMBDA_JS_RUNTIME = "nodejs22.x";
  }
  const chromium = (await import("@sparticuz/chromium")).default;
  if (typeof chromium.setGraphicsMode === "function") {
    chromium.setGraphicsMode(false);
  }
  const executablePath = await chromium.executablePath();
  const execDir = path.dirname(executablePath);
  if (!process.env.LD_LIBRARY_PATH?.includes(execDir)) {
    process.env.LD_LIBRARY_PATH = [execDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  }
  return {
    executablePath,
    args: chromium.args,
    env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || execDir },
  };
}
