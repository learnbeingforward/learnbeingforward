// Runs student-submitted code on a hosted, Piston-compatible execution API — never
// on this app's own server, since running arbitrary student-submitted code locally
// would be a real security risk (the student is the untrusted party; this server
// also runs the production app).
//
// The original free public Piston instance (emkc.org) closed to anonymous use in
// Feb 2026 — it's now whitelist-only. This now points at onlinecompiler.io, a
// hosted Piston-compatible replacement with a free tier (100,000 runs/month, no
// card required). It needs an API key — see CODE_EXEC_API_KEY below.

const EXEC_API = "https://api.onlinecompiler.io/api/v2/piston";

export type SupportedLanguage = "python" | "java" | "c" | "cpp";

const LANGUAGE_NAME: Record<SupportedLanguage, string> = {
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
};

const FILE_NAME: Record<SupportedLanguage, string> = {
  python: "main.py",
  java: "Main.java",
  c: "main.c",
  cpp: "main.cpp",
};

export type RunResult = {
  stdout: string;
  stderr: string;
  compileError: string | null;
  timedOut: boolean;
};

const EXECUTION_TIMEOUT_MS = 8000;

/** Runs one program against one stdin input and returns raw stdout/stderr. Doesn't
 * compare against an expected output — callers do that themselves (trimmed
 * comparison), since what counts as a "match" can vary by question. */
export async function runCode(language: SupportedLanguage, code: string, stdin: string): Promise<RunResult> {
  // Trim whitespace and strip any surrounding quotes — some hosting panels'
  // env-var forms save the value exactly as typed, quotes included, which
  // would otherwise silently break the Authorization header below.
  const apiKey = process.env.CODE_EXEC_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error(
      "Code execution isn't configured yet — set CODE_EXEC_API_KEY (see your onlinecompiler.io account) in the environment."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${EXEC_API}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({
        language: LANGUAGE_NAME[language],
        version: "*",
        files: [{ name: FILE_NAME[language], content: code }],
        stdin,
        run_timeout: EXECUTION_TIMEOUT_MS,
        compile_timeout: EXECUTION_TIMEOUT_MS,
      }),
    });
  } catch (err) {
    throw new Error(
      `Couldn't reach the code execution service (network error: ${err instanceof Error ? err.message : "unknown"}). Try again in a moment.`
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message ?? "";
    } catch {
      // ignore — fall back to the generic message below
    }
    throw new Error(
      detail
        ? `The code execution service rejected the request: ${detail}`
        : `The code execution service rejected the request (HTTP ${res.status}) — try again in a moment.`
    );
  }

  const data = (await res.json()) as {
    compile?: { stdout: string; stderr: string; code: number | null; signal: string | null };
    run: { stdout: string; stderr: string; code: number | null; signal: string | null };
  };

  if (data.compile && data.compile.code !== 0 && data.compile.code !== null) {
    return { stdout: "", stderr: "", compileError: data.compile.stderr || "Compilation failed.", timedOut: false };
  }

  return {
    stdout: data.run.stdout,
    stderr: data.run.stderr,
    compileError: null,
    timedOut: data.run.signal === "SIGKILL",
  };
}

/** Trimmed, whitespace-collapsed comparison — stdout/expected output rarely match
 * byte-for-byte (trailing newlines, trailing spaces per line) even when the answer
 * is clearly correct, so this normalizes before comparing rather than demanding an
 * exact string match. */
export function outputsMatch(actual: string, expected: string): boolean {
  const normalize = (s: string) =>
    s
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  return normalize(actual) === normalize(expected);
}
