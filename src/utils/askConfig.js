// Public URL of the Cloudflare Worker (proxy/) that holds the site's OpenAI key.
// Without it Ask the Library can't answer, so its buttons are hidden.
export const ASK_PROXY_URL = import.meta.env.VITE_ASK_PROXY_URL || '';
export const ASK_ENABLED = Boolean(ASK_PROXY_URL);
