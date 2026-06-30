const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-v4-flash";
const DEFAULT_PROMPT =
  "Create a concise marketing campaign for HiveAI, an AI marketing dashboard for small businesses. Include positioning, three social posts, and next steps.";

function cleanText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeBaseUrl(value) {
  const baseUrl = cleanText(value, DEFAULT_BASE_URL);
  try {
    const parsed = new URL(baseUrl);
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Invalid DEEPSEEK_BASE_URL: ${baseUrl}`);
  }
}

function redactSecret(value) {
  if (!value) return "not_provided";
  return `${value.slice(0, 5)}...${value.slice(-4)}`;
}

async function main() {
  const apiKey = cleanText(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_COMPATIBLE_API_KEY);
  if (!apiKey) {
    throw new Error("Set DEEPSEEK_API_KEY before running this script.");
  }

  const baseUrl = normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL);
  const model = cleanText(process.env.DEEPSEEK_MODEL, DEFAULT_MODEL);
  const prompt = cleanText(process.argv.slice(2).join(" "), DEFAULT_PROMPT);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are HiveAI's marketing agent. Build practical, publish-ready marketing assets. Never reveal or repeat API keys, secrets, or private credentials.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const providerMessage = data?.error?.message || data?.message || "Provider request failed.";
    throw new Error(`DeepSeek request failed (${response.status}): ${providerMessage}`);
  }

  const content = data?.choices?.[0]?.message?.content || "";
  console.log(JSON.stringify({
    ok: true,
    provider: "deepseek",
    baseUrl,
    model: data?.model || model,
    apiKey: redactSecret(apiKey),
    prompt,
    response: content,
    usage: data?.usage || null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
