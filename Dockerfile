# Use Node 18
FROM node:18

# Install Python + ffmpeg
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy server code
COPY index.js .

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
