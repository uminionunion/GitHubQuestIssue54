# Food Pantry Finder - Local Development Setup

## Overview
This is a full-stack Node.js + React application for finding and managing food pantries. The app uses Express.js for the backend API, React for the frontend, and SQLite for persistent data storage.

## System Requirements

### Node.js & Runtime
- **Node.js**: 18.0.0 or higher (LTS recommended)
- **npm**: 9.0.0 or higher
- **Runtime Environment**: Linux, macOS, or Windows

### Database
- **SQLite**: 3.0+ (included with better-sqlite3)
- **Database Location**: `./data/database.sqlite`

## Dependencies Overview

### Key Frontend Dependencies
- React 18.2.0 - UI library
- React Router 7.9.4 - Client-side routing
- Tailwind CSS 3.4.17 - Styling
- Leaflet 1.9.4 + React Leaflet 4.2.1 - Maps
- shadcn/ui components - Pre-built UI components

### Key Backend Dependencies
- Express 5.1.0 - HTTP server framework
- Kysely 0.28.8 - Type-safe SQL query builder
- Better SQLite3 12.4.1 - SQLite driver
- TypeScript 5.8.2 - Type safety

### Build Tools
- Vite 6.3.1 - Frontend bundler
- tsx 4.19.3 - TypeScript execution for Node.js

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/food-pantry-finder.git
cd food-pantry-finder
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages from `package.json`.

### 3. Verify Installation
Check that Node and npm are properly installed:
```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### 4. Start Development Server
```bash
npm start
```

This command will:
- Build the React frontend with Vite (running on port 3000)
- Start the Express backend (running on port 3001)
- Enable hot reload for both frontend and backend
- Open the app in your browser automatically

### 5. Access the Application
Once started, the app should automatically open at:
```
http://localhost:3000
```

If it doesn't open automatically, manually navigate to that URL in your browser.

## What to Expect on First Run

### Frontend (Port 3000)
- React development server serving the UI
- Hot module replacement enabled for instant code updates
- Tailwind CSS styling fully applied

### Backend (Port 3001)
- Express API server handling requests
- SQLite database auto-initialized at `./data/database.sqlite`
- All routes logged to terminal for debugging

### Database
- SQLite database automatically created on first run
- Location: `./data/database.sqlite`
- Supporting files: `./data/database.sqlite-shm`, `./data/database.sqlite-wal`

## Available Scripts

```bash
# Start development server with hot reload
npm start

# Build for production
npm run build

# Compile TypeScript (development)
tsc

# Run TypeScript compiler on server code
tsc --project tsconfig.server.json
```

## Project Structure

```
food-pantry-finder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML entry point
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── db.ts              # Database configuration
│   ├── types.ts           # TypeScript types
│   └── static-serve.ts    # Static file serving
├── data/                  # Persistent data
│   └── database.sqlite    # SQLite database (auto-created)
├── scripts/
│   └── dev.ts             # Development server script
├── package.json           # Dependencies and scripts
├── tsconfig.json          # Frontend TypeScript config
├── tsconfig.server.json   # Backend TypeScript config
├── vite.config.js         # Vite build configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Development Workflow

### Making Changes to Frontend
1. Edit files in `client/src/`
2. Changes are automatically reflected at `http://localhost:3000`
3. Check browser console for any errors

### Making Changes to Backend
1. Edit files in `server/`
2. Server automatically restarts on changes
3. Check terminal for any errors or API logs

### Adding Database Tables/Schema
1. Edit `server/db.ts` or `server/types.ts`
2. Create migrations if needed
3. Restart the server (`npm start`)

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3 |
| Components | shadcn/ui (Radix UI) |
| Maps | Leaflet + React Leaflet |
| Backend | Express 5 |
| Database | SQLite + Kysely |
| Type Safety | TypeScript 5 |

## Troubleshooting

### "Port 3000 already in use"
```bash
# On macOS/Linux, kill process on port 3000
lsof -ti:3000 | xargs kill -9

# On Windows, kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Port 3001 already in use"
Same as above but with port 3001.

### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Database locked" or corruption
```bash
# Remove temporary database files
rm -f data/database.sqlite-shm data/database.sqlite-wal

# Restart server
npm start
```

### "Vite build fails"
```bash
# Clear Vite cache and reinstall
rm -rf node_modules dist .vite
npm install
npm start
```

### Module not found errors
Ensure you're using relative imports:
```typescript
// ✅ Correct
import { Button } from "../components/ui/button"

// ❌ Wrong (path aliases not configured)
import { Button } from "@/components/ui/button"
```

## Building for Production

### Build the Application
```bash
npm run build
```

This creates:
- `dist/client/` - Compiled React frontend
- `dist/server/` - Compiled Express backend

### Run Production Build Locally
```bash
# After building
node dist/server/index.js
```

Access at `http://localhost:4000`

## Environment Variables

Create a `.env` file in the root directory for local development:

```
NODE_ENV=development
PORT=3001
DATA_DIRECTORY=./data/
```

## Database Backup

To backup your local database:
```bash
# Copy the database file
cp data/database.sqlite data/database.sqlite.backup
```

To restore:
```bash
cp data/database.sqlite.backup data/database.sqlite
```

## Performance Tips

- Use React DevTools browser extension for debugging
- Check Network tab in browser DevTools to monitor API requests
- Use `console.log()` in both frontend and backend code
- Terminal shows backend logs; browser console shows frontend logs

## Getting Help

### Check Logs
- **Backend logs**: Terminal where `npm start` is running
- **Frontend logs**: Browser DevTools Console (F12)
- **Database queries**: Check server terminal for logged Kysely queries

### Common Log Patterns
- `[API] GET /api/pantries` - Backend API request
- `Query: SELECT * FROM ...` - Database query execution
- `[HMR] update` - Frontend hot module reload
- Type errors shown in terminal with line numbers

## Next Steps

1. **Explore the codebase**: Start in `client/src/App.tsx` and `server/index.ts`
2. **Add a feature**: Create a new component in `client/src/components/`
3. **Add an API endpoint**: Create a new route in `server/index.ts`
4. **Push to GitHub**: When ready, push your changes to a GitHub repository

## License
Private project - all rights reserved
