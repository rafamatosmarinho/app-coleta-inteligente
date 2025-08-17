# Use Node.js 18 as the base image for the builder stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and the npm lock file
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lean Node.js image for the runner stage
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy only the necessary files for a standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]