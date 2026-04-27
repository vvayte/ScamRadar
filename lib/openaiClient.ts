import OpenAI from 'openai';

/**
 * A thin wrapper around the OpenAI client. It uses the API key from the
 * environment and can be reused across requests. If the key is missing,
 * calls will fail with a descriptive error.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;