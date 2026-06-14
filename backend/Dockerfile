# SkillPath backend - production image
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Inbuilt coding arena compiler toolchain for JavaScript, Python, C++, and Java.
RUN apk add --no-cache python3 g++ openjdk17-jdk

# Install only production dependencies, reproducibly, from the lockfile.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run as a non-root user.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5000

# Container-level health check hitting the API's /api/health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "start"]
