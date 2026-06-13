import { connectRedis, disconnectRedis } from "../config/redis.js";

const baseUrl = process.env.API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const start = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.json();
  const end = Date.now();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${body.message}`);
  }
  return { body, timeMs: end - start };
}

async function runTest() {
  console.log("Connecting to Redis...");
  const redis = await connectRedis();

  console.log("Clearing cache...");
  await redis.flushAll();

  // Login
  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "student1@faraway.local",
      password: process.env.SEED_ADMIN_PASSWORD || "Admin1234",
    }),
  });
  const auth = { authorization: `Bearer ${login.body.data.accessToken}` };

  console.log("\n--- Testing Cache Speed ---");
  // First request (Cache miss)
  console.log("Fetching /competitions (Cache miss)...");
  const req1 = await request("/competitions", { headers: auth });
  console.log(`Time taken: ${req1.timeMs}ms`);

  // Second request (Cache hit)
  console.log("\nFetching /competitions again (Cache hit)...");
  const req2 = await request("/competitions", { headers: auth });
  console.log(`Time taken: ${req2.timeMs}ms`);

  console.log("\n--- Checking Redis Keys ---");
  const keys = await redis.keys("*");
  console.log("Keys in Redis:", keys);

  if (keys.some(k => k.includes("competitions:list"))) {
    console.log("✅ SUCCESS: Found competitions:list in Redis cache.");
  } else {
    console.log("❌ ERROR: Cache key not found in Redis.");
  }

  // Disconnect
  await disconnectRedis();
  console.log("\nTest completed.");
}

runTest().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
