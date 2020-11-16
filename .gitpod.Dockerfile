FROM gitpod/workspace-full

# Install custom tools, runtime, etc.
RUN npm install -g firebase-tools && npm install -g @angular/cli
