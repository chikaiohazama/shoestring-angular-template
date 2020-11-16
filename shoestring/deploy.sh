#!/bin/sh
#
# Docker entrypoint script for deploying to Firebase. Executes in the
# builder Docker container and creates a symlink in the Cloud Build
# workspace pointing to the functions node_modules directory
# pre-installed in the container image. The node_modules directory is
# needed for compiling with tsc (see functions.predeploy in
# firebase.json).

set -e

ln -sf /deps/functions/node_modules functions

if [ "$1" != 'auto' -a "$1" != 'tag' ]; then
    echo "Usage: $0 <auto|tag>"
    exit 1
fi

if [ "$1" = 'auto' ]; then
    MESSAGE=$SHORT_SHA
else
    MESSAGE="$TAG_NAME ($SHORT_SHA)"
fi

echo "firebase-tools@$(firebase --version)"
echo firebase --project="$PROJECT_ID" deploy --force --message="$MESSAGE"
exec firebase --project="$PROJECT_ID" deploy --force --message="$MESSAGE"
