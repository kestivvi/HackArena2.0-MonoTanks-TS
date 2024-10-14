# Step 1: Use an official Node.js base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package.json ./

# Step 4: Install any dependencies (if you have any)
RUN npm install

# Step 5: Copy the rest of the application files to the container
COPY . .

RUN npx tsc

# Step 6: Define the command to run the application with CLI arguments
ENTRYPOINT ["node", "./dist/index.js"]
