# Development commands

# Run typecheck across all packages
typecheck: build
    pnpm typecheck

# Build all packages
build:
    pnpm build

# Clean build artifacts
clean:
    rm -rf api/dist backend/dist frontend/.svelte-kit frontend/build
    rm -rf node_modules */node_modules

# Clean build (remove artifacts then build)
clean-build: clean install build
    echo "✅ Clean build complete!"

# Run the backend server
run-backend:
    cd backend && pnpm dev

# Run the frontend dev server
run-frontend:
    cd frontend && pnpm dev

# Run API, backend and frontend in parallel with watch mode
dev:
    #!/usr/bin/env bash
    cd api && pnpm dev &
    cd backend && pnpm dev &
    cd frontend && pnpm dev &
    wait

dev-backend:
    cd backend && pnpm dev

dev-frontend:
    cd frontend && pnpm dev

# Clean and install dependencies
install:
    pnpm install

# Full development setup
setup: install build typecheck
    echo "✅ Project setup complete!"

# Format code with Prettier
fmt:
    pnpm exec prettier --write "**/*.{js,ts,json,md,html,css,scss,svelte}"

# Kill development servers
kill:
    #!/usr/bin/env bash
    echo "🔪 Killing development servers..."
    # Kill backend processes (node processes running from backend directory)
    pkill -f "node.*backend" 2>/dev/null || echo "No backend processes found"
    # Kill frontend processes (node processes running from frontend directory)
    pkill -f "node.*frontend" 2>/dev/null || echo "No frontend processes found"
    # Kill any pnpm dev processes
    pkill -f "pnpm.*dev" 2>/dev/null || echo "No pnpm dev processes found"
    # Kill TypeScript watch processes
    pkill -f "tsc.*--watch" 2>/dev/null || echo "No TypeScript watch processes found"
    pkill -f "tsx.*--watch" 2>/dev/null || echo "No tsx watch processes found"
    echo "✅ All development servers killed"
