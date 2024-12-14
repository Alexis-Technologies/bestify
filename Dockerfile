# We use the official Node.js LTS image as a base image
FROM node:18-alpine

# Setting the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Setting dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Setting the environment variable
ENV NODE_ENV=production

# Open the port on which Fastify runs (default 3000)
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
