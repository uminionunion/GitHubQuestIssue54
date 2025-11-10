// server/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import type { Pantry } from './types.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Normalize a raw BASE_PATH or BASE_URL value so it is always a safe single pathname.
 *
 * - Accepts:
 *   - a path-only value like "/api" or "api" -> returns "/api"
 *   - a full URL like "https://example.com/base/path" -> returns "/base/path"
 * - Ensures:
 *   - result starts with "/"
 *   - no trailing slash (except for root "/")
 *   - rejects values that would still contain a scheme/host or stray ":" characters
 *     and falls back to "/" while logging a warning
 */
function normalizeBasePath(raw?: string) {
  if (!raw) return '/';

  // Trim whitespace
  raw = String(raw).trim();

  // If it looks like a full URL (contains ://) try to parse and use the pathname
  if (raw.includes('://')) {
    try {
      const u = new URL(raw);
      const pathname = u.pathname || '/';
      return sanitizePathname(pathname);
    } catch {
      // If parsing fails, fall through to the fallback below
      console.warn('normalizeBasePath: provided BASE_PATH/BASE_URL looks like a URL but failed to parse, falling back to path-only handling');
    }
  }

  // If raw includes a host-like value without scheme (example: "git.example.com/base"),
  // try to detect and extract the path after first slash. Otherwise treat as path.
  const firstSlash = raw.indexOf('/');
  if (firstSlash > 0 && !raw.startsWith('/')) {
    // Example: "git.example.com/base/path" -> "/base/path"
    const candidate = raw.slice(firstSlash);
    if (candidate) return sanitizePathname(candidate);
  }

  // Otherwise treat as a path-like string (ensure leading slash)
  const candidatePath = raw.startsWith('/') ? raw : '/' + raw;
  return sanitizePathname(candidatePath);
}

function sanitizePathname(pathname: string) {
  // Remove trailing slashes (but keep root "/")
  let p = pathname.replace(/\/+$/g, '');
  if (p === '') p = '/';

  // Defensive checks: path must not contain a scheme or colon that would confuse path-to-regexp
  // (e.g., "https:"). If it does, warn and fallback to "/".
  if (/[A-Za-z0-9.+-]+:\/\//.test(p) || p.includes(':')) {
    console.warn(`normalizeBasePath: sanitized path "${p}" still contains a scheme or colon; falling back to "/"`);
    return '/';
  }

  return p;
}

const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || process.env.BASE_URL);

// Informational log so you can see exactly what was mounted
console.log(`Using BASE_PATH = "${BASE_PATH}"`);

/**
 * Mount API routes under BASE_PATH so app can run behind a reverse-proxy with a path prefix.
 * If no BASE_PATH is set, this is simply '/' and behavior is unchanged.
 */
const router = express.Router();

// API endpoints (mounted on router so we can attach a base path if needed)
router.get('/api/pantries', async (req, res) => {
  try {
    const pantries = await db.selectFrom('pantries').selectAll().where('deleted', '=', 0).execute();
    res.json(pantries);
  } catch (error) {
    console.error('Failed to get pantries:', error);
    res.status(500).json({ message: 'Failed to retrieve pantries' });
  }
});

router.post('/api/pantries', async (req, res) => {
  try {
    const newPantry: Omit<Pantry, 'id' | 'deleted'> = req.body;
    const result = await db.insertInto('pantries').values({ ...newPantry, deleted: 0 }).returningAll().executeTakeFirstOrThrow();
    res.status(201).json(result);
  } catch (error) {
    console.error('Failed to add pantry:', error);
    res.status(500).json({ message: 'Failed to add pantry' });
  }
});

router.get('/api/politicians', async (req, res) => {
  try {
    const politicians = await db.selectFrom('politicians').selectAll().execute();
    res.json(politicians);
  } catch (error) {
    console.error('Failed to get politicians:', error);
    res.status(500).json({ message: 'Failed to retrieve politicians' });
  }
});

router.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.selectFrom('candidates').selectAll().execute();
    res.json(candidates);
  } catch (error) {
    console.error('Failed to get candidates:', error);
    res.status(500).json({ message: 'Failed to retrieve candidates' });
  }
});

router.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ message: 'Address is required' });
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const geoResponse = await fetch(url, {
      headers: {
        'User-Agent': 'PantryFinderApp/1.0'
      }
    });
    if (!geoResponse.ok) {
      throw new Error(`Nominatim API failed with status: ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();

    if (geoData && geoData.length > 0) {
      const { lat, lon } = geoData[0];
      res.json({ lat: parseFloat(lat), lng: parseFloat(lon) });
    } else {
      res.status(404).json({ message: 'Coordinates not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Geocoding service failed' });
  }
});

// Mount router under BASE_PATH (ensures only path portion used)
app.use(BASE_PATH, router);

// Export a function to start the server
export async function startServer(port: number | string = process.env.PORT || 3001) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // static serving will ignore API paths; setupStaticServing expects the app root, it uses __dirname logic
      setupStaticServing(app);
    }

    // Start listening
    const p = typeof port === 'string' ? parseInt(port, 10) : port;
    app.listen(p, () => {
      console.log(`API Server running on port ${p} (base path: ${BASE_PATH})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
