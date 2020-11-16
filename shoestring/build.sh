#!/bin/sh
#
# Docker entrypoint script for running build steps. Executes in the
# builder Docker container and creates symlinks in the Cloud Build
# workspace pointing to the frontend and functions node_modules
# directories pre-installed in the container image.

ln -sf /deps/node_modules .
ln -sf /deps/functions/node_modules functions
exec "$@"
