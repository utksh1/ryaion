# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Expose the port from .env or default to 3001
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/server.js"]
