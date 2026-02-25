# stage-1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# stage-2: build the app
FROM node:20-alpine AS builder 
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV STRIPE_API_KEY=dummy
ENV STRIPE_WEBHOOK_SECRET=dummy
ENV STRIPE_PRO_PRICE_ID=dummy
ENV GOOGLE_CLIENT_ID=dummy
ENV GOOGLE_CLIENT_SECRET=dummy
ENV UPSTASH_REDIS_REST_URL=https://dummy.upstash.io
ENV UPSTASH_REDIS_REST_TOKEN=dummy
ENV RESEND_API_KEY=dummy
ENV CRON_SECRET=dummy
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV NEXTAUTH_SECRET=dummy
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_URL=http://localhost:3000
ENV AWS_REGION=us-east-1
ENV AWS_ACCESS_KEY_ID=dummy
ENV AWS_SECRET_ACCESS_KEY=dummy
ENV AWS_SQS_QUEUE_URL=https://dummy.amazonaws.com
ENV EMAIL_USER=dummy
ENV EMAIL_PASS=dummy
RUN npx prisma generate
RUN npm run build

# stage-3: production image
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
