# Use a lightweight Node.js image as the base
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the server and web build into the container
COPY src/stremio-server/server.js /app/server.js
COPY src/stremio-web/build /app/build

# Install dependencies for the HTTP server
RUN npm install -g http-server

# Expose the ports for the Stremio server and HTTP server
EXPOSE 11470 12470 8080

# Start both the Stremio server and HTTP server
CMD ["sh", "-c", "node server.js & http-server /app/build -p 8080"]
