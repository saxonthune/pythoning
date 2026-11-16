# python-interview-prep tasks. The web site is the primary target; drills at
# the terminal are deprecated.

# List available recipes
default:
    @just --list

# Regenerate web/public/problems.json + web_harness.py + utils.py
transform:
    python build/transform.py

# Install web/ npm dependencies (npm ci)
web-install:
    cd web && npm ci

# Run transform then start the Astro dev server
dev: transform
    cd web && npm run dev

# Run transform then build the static site to web/dist/
build: transform
    cd web && npm run build

# Remove generated web assets (problems.json, copied py files)
clean:
    rm -f web/src/data/problems.json web/public/web_harness.py web/public/utils.py

# Remove web/node_modules, web/dist, web/.astro
clean-web:
    rm -rf web/node_modules web/dist web/.astro
