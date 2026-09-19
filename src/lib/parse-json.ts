/** Safely parse JSON request bodies — returns 400 response on malformed input */

export async function parseJsonBody<T = Record<string, unknown>>(
  req: Request
): Promise<{ data: T | null; error: Response | null }> {
  try {
    const data = (await req.json()) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
}
