// Runs student-submitted code on Piston (https://github.com/engineer-man/piston), a
// free public code-execution API — never on this app's own server, since running
// arbitrary student-submitted code locally would be a real security risk (the
// student is the untrusted party; this server also runs the production app).
//
// Piston requires an exact runtime name + version per language, and the versions
// it has installed can change over time, so rather than hardcoding a version that
// could go stale, this fetches the current runtime list once per process and
// picks the latest version for each language we support.

const PISTON_API = "https://emkc.org/api/v2/piston";

export type SupportedLanguage = "python" | "java" | "c" | "cpp";

const PISTON_LANGUAGE_NAME: Record<SupportedLanguage, string> = {
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

type PistonRuntime = { language: string; version: string; aliases: string[] };

let cachedRuntimes: PistonRuntime[] | null = null;
let cachedAt = 0;
const RUNTIME_CACHE_MS = 60 * 60 * 1000;

async function getRuntimeVersion(language: SupportedLanguage): Promise<string> {
  const now = Date.now();
  if (!cachedRuntimes || now - cachedAt > RUNTIME_CACHE_MS) {
    const res = await fetch(`${PISTON_API}/runtimes`);
    if (!res.ok) throw new Error("Couldn't reach the code execution service — try again in a moment.");
    cachedRuntimes = (await res.json()) as PistonRuntime[];
    cachedAt = now;
  }
  const name = PISTON_LANGUAGE_NAME[language];
  const match = cachedRuntimes.find((r) => r.language === name || r.aliases.includes(name));
  if (!match) throw new Error(`${language} isn't available on the code execution service right now.`);
  return match.version;
}

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
  const version = await getRuntimeVersion(language);

  const res = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: PISTON_LANGUAGE_NAME[language],
      version,
      files: [{ name: FILE_NAME[language], content: code }],
      stdin,
      run_timeout: EXECUTION_TIMEOUT_MS,
      compile_timeout: EXECUTION_TIMEOUT_MS,
    }),
  });

  if (!res.ok) {
    throw new Error("The code execution service rejected the request — try again in a moment.");
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
