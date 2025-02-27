const MAX_REQUESTS = 25;
const WINDOW_TTL = 900;
const LINK_LIFESPAN = 604800

async function checkRateLimit(request: Request, env: Env): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const countStr = await env.RATE_LIMIT.get(ip);
  const count = countStr ? parseInt(countStr) : 0;
  if (count >= MAX_REQUESTS) return false;
  await env.RATE_LIMIT.put(ip, (count + 1).toString(), { expirationTtl: WINDOW_TTL });
  return true;
}

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
* Generates a short key:
* - Takes the first 8 characters of the full SHA‑512.
* - If the key is already taken by another JSON, increases the length until a free value is found.
* - If the key already exists for the same JSON, throws a duplicate error.
*/
async function generateShortKey(data: unknown, env: Env): Promise<string> {
  const jsonData = JSON.stringify(data);
  const fullHash = await sha512(jsonData);
  let keyLength = 8;
  let candidate = fullHash.substring(0, keyLength);
  while (true) {
    const existingValue = await env.LINKS.get(candidate);
    if (!existingValue) {
      // Key is Free
      return candidate;
    } else {
      // If Duplicate
      if (existingValue === jsonData) {
        throw new Error("Duplicate entry: JSON with this hash already exists");
      }
      // Collision
      keyLength++;
      if (keyLength > fullHash.length) {
        throw new Error("Unable to generate unique key");
      }
      candidate = fullHash.substring(0, keyLength);
    }
  }
}

function createResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
		if (!(await checkRateLimit(request, env))) {
			return createResponse(`You have exceeded the allowed number of ${MAX_REQUESTS} requests within the last ${WINDOW_TTL} seconds.`, 429);
		}

    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return createResponse("", 204);
    }

    if (request.method === "POST") {
			try {
        const body = (await request.json()) as { data: unknown; token?: string };
		
				if (!body.data) {
					return createResponse("Missing 'data' field", 400);
				}
		
				let key: string;

				try {
          key = await generateShortKey(body.data, env);
        } catch (error: any) {
          // If the data already exists or the key generation failed
          return createResponse(error.message, 409);
        }
  
				const permanentToken = env.PERMANENT_TOKEN as string | undefined;
        const isPermanent = body.token && permanentToken && body.token === permanentToken;
        const putOptions = isPermanent ? {} : { expirationTtl: LINK_LIFESPAN };

				await env.LINKS.put(key, JSON.stringify(body.data), putOptions);

				console.log("Saved with key:", key);
		
				const response = { 
					key, 
					isPermanent: isPermanent,
					linkLefespan: LINK_LIFESPAN
				};
				
				return createResponse(JSON.stringify(response));
			} catch (error) {
				console.error("Error processing POST request:", error);
				return createResponse("Invalid request body", 400);
			}
		}
		

    if (request.method === "GET") {
      const key = url.pathname.split("/").pop();
      if (!key) return createResponse("Key not provided", 400);

      const value = await env.LINKS.get(key);
      if (!value) return createResponse("Not found", 404);

      return createResponse(value);
    }

    return createResponse("Method not allowed", 405);
  },
};

