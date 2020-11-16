# Dockerfile for builder container image. Installs dependencies and
# prepares the environment for running build and deployment steps. The
# steps are run outside this Dockerfile (in the Cloud Build
# configuration) so they can be run selectively and/or concurrently.

# Node.js runtime versions:
# https://cloud.google.com/functions/docs/concepts/exec
FROM node:10.22.0-alpine3.9 AS deps
RUN apk add --no-cache chromium chromium-chromedriver
ENV CHROME_BIN=/usr/bin/chromium-browser
# Install frontend deps.
WORKDIR /deps
COPY package.json package-lock.json ./
RUN npm install
# Install Firebase CLI and Cloud Functions deps.
RUN npm install -g firebase-tools@^8.0.0
COPY functions/package.json functions/package-lock.json functions/
RUN npm --prefix=functions install
COPY shoestring/build.sh shoestring/deploy.sh /
ENTRYPOINT ["/build.sh", "sh", "-c"]
