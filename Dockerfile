FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy package.json and the lock file and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# 2. Copy the rest of the application code, including the prisma directory
COPY . .

# 3. Now that all files are copied, run prisma generate
RUN npx prisma generate

# 4. Build the Next.js application
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]