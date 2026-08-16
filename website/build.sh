#!/usr/bin/env bash
# Assemble the GitHub Pages site from the already-built artifacts:
#   website/dist  -> website/build/           (landing page at the root)
#   examples/dist -> website/build/examples/
#   dist-typedoc  -> website/build/docs/      (typedoc API reference)
#
# Expects `pnpm build:website`, `pnpm build:examples`, and `pnpm typedoc` to
# have run first. Output is written to website/build/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$ROOT/website/build"

rm -rf "$SITE"
mkdir -p "$SITE"
cp -r "$ROOT/website/dist/." "$SITE/"
mkdir -p "$SITE/examples" && cp -r "$ROOT/examples/dist/." "$SITE/examples/"
mkdir -p "$SITE/docs" && cp -r "$ROOT/dist-typedoc/." "$SITE/docs/"
touch "$SITE/.nojekyll"

echo "assembled $SITE"
