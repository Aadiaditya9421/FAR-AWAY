const baseUrl = process.env.API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${body.message}`);
  }
  return body;
}

async function run() {
  await request("/health");

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "student1@faraway.local",
      password: process.env.SEED_ADMIN_PASSWORD || "Admin1234",
    }),
  });

  const token = login.data.accessToken;
  const auth = { authorization: `Bearer ${token}` };

  const checks = [
    ["/auth/me", auth],
    ["/assessments", auth],
    ["/competitions", auth],
    ["/leaderboard/JavaScript", auth],
    ["/coins/balance", auth],
    ["/coins/transactions", auth],
    ["/skillswap/requests", auth],
    ["/analytics/progress", auth],
  ];

  for (const [path, headers] of checks) {
    await request(path, { headers });
    console.log(`OK ${path}`);
  }

  console.log("Backend smoke test passed");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
