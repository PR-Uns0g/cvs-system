#!/bin/sh
set -eu

dependency_hash="$(sha256sum package.json package-lock.json | sha256sum | cut -d ' ' -f1)"
installed_hash=""

if [ -f node_modules/.dependency-hash ]; then
  installed_hash="$(cat node_modules/.dependency-hash)"
fi

if [ "$dependency_hash" != "$installed_hash" ]; then
  npm ci
  printf '%s\n' "$dependency_hash" > node_modules/.dependency-hash
fi

exec npm run dev -- --host 0.0.0.0
