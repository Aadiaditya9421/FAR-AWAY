import dotenv from "dotenv";

dotenv.config();

function toBool(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

const smtpPort = Number(process.env.SMTP_PORT || 587);

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/far-away",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: smtpPort,
    // TLS is implicit on 465; STARTTLS (587/25) uses secure=false.
    // Override explicitly with SMTP_SECURE when your provider differs.
    secure: toBool(process.env.SMTP_SECURE, smtpPort === 465),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Far Away <no-reply@far-away.local>",
    replyTo: process.env.SMTP_REPLY_TO || "",
    // Reuse a pooled set of connections instead of opening one per email.
    pool: toBool(process.env.SMTP_POOL, true),
    // Reject self-signed certs by default; set false only for local test relays.
    rejectUnauthorized: toBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true),
  },
};

export const isProduction = env.nodeEnv === "production";

// True when real SMTP credentials/host are present and email should be sent for real.
export const isEmailConfigured = Boolean(env.smtp.host);
