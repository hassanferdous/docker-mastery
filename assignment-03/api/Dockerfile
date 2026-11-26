# syntax=docker/dockerfile:1

#============================
# Stage-01: Dependencies
#============================
FROM node:26-alpine AS deps

WORKDIR /app

COPY package*.json .

RUN --mount=type=cache,target=/root/.npm \
    npm ci

#===========================================
# Stage-02: Build / Application preparation
#===========================================
FROM node:26-alpine AS build

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

#============================================
# Stage-03: Runtime / Run the application
#============================================
FROM node:26-alpine AS runtime

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8000

# Copy only package files
COPY package*.json ./

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy build outputs and other neccessary files from the build stage
COPY --from=build --chown=node:node /app/* .

USER node

EXPOSE 8000

CMD ["npm", "run", "start"]