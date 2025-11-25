# ✅ Gunakan image Node.js versi LTS
FROM node:18-alpine

# ✅ Set working directory
WORKDIR /app

# ✅ Copy package files terlebih dahulu untuk caching
COPY package*.json ./

# ✅ Install dependencies
RUN npm install --only=production

# ✅ Copy source code
COPY . .

# ✅ Create non-root user untuk security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# ✅ Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# ✅ Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# ✅ Start application
CMD ["node", "server.js"]