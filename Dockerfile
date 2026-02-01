FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . .      
EXPOSE 3000
CMD ["npm", "start"]
# This Dockerfile sets up a Node.js application using the official Node.js 20 Alpine image.
# It installs the dependencies defined in package.json and starts the application on port 3000. 