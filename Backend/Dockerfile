FROM node:18-alpine

WORKDIR /app

# Install Python, g++, make, and other dependencies
RUN apk add --update --no-cache python3 python3-dev g++ make

# Install required Python packages
RUN python3 -m ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools && \
    pip3 install --no-cache virtualenv

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "dist/server.js"]
