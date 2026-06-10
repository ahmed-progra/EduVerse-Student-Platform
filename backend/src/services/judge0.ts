const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  cpp: 54,
};

const NON_EXECUTABLE_LANGUAGES = new Set(["html", "css"]);

export interface Judge0Result {
  stdout: string;
  stderr: string;
  error: string | null;
  time: string;
  status: string;
}

export async function executeCode(
  sourceCode: string,
  language: string,
  stdin: string = ""
): Promise<Judge0Result> {
  if (NON_EXECUTABLE_LANGUAGES.has(language)) {
    return {
      stdout: sourceCode,
      stderr: "",
      error: null,
      time: "0",
      status: "Rendered (markup/styling - not executed)",
    };
  }

  const langId = LANGUAGE_IDS[language];

  if (!langId) {
    return {
      stdout: "",
      stderr: "",
      error: `Unsupported language: ${language}`,
      time: "0",
      status: "Error",
    };
  }

  try {
    const createRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: langId,
        stdin,
      }),
    });

    if (!createRes.ok) throw new Error("Judge0 request failed");

    const result = await createRes.json();

    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      error: result.compile_output || result.message || null,
      time: result.time || "0",
      status: result.status?.description || "Unknown",
    };
  } catch (err) {
    return {
      stdout: "",
      stderr: "",
      error: err instanceof Error ? err.message : "Execution failed",
      time: "0",
      status: "Error",
    };
  }
}
