import OpenAI from "openai";

/**
 * Lazy proxy around the OpenAI client. Instantiating eagerly causes Next.js
 * page-data collection to fail when OPENAI_API_KEY is unavailable at build
 * time (e.g. on CI or in preview environments). The proxy defers construction
 * until the first method is actually invoked at runtime.
 */
let cached: OpenAI | null = null;

function getClient(): OpenAI {
  if (!cached) {
    cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }
  return cached;
}

const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default openai;
