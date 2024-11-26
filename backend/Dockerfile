# Dockerfile for the Node.js backend
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend API port
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
