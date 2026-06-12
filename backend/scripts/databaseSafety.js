const DEFAULT_ALLOW_ENV = "ALLOW_REMOTE_DB_MUTATION";

function getMongoHost(uri) {
  try {
    const parsed = new URL(uri);
    return parsed.hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isLocalMongoUri(uri = "") {
  const host = getMongoHost(uri);
  return ["localhost", "127.0.0.1", "::1", "mongo"].includes(host);
}

export function assertSafeDatabaseMutation(
  mongoUri,
  {
    scriptName = "script",
    allowEnv = DEFAULT_ALLOW_ENV,
    purpose = "mutate database records",
  } = {}
) {
  if (isLocalMongoUri(mongoUri)) return;

  const allowedByEnv = process.env[allowEnv] === "true";
  const allowedByFlag = process.argv.includes("--allow-remote-db-mutation");
  if (allowedByEnv || allowedByFlag) return;

  throw new Error(
    [
      `${scriptName} refused to ${purpose}.`,
      "The configured MONGO_URI does not look like local Docker/localhost MongoDB.",
      `Use the local Docker stack, or set ${allowEnv}=true / pass --allow-remote-db-mutation when you intentionally want this.`,
    ].join(" ")
  );
}

