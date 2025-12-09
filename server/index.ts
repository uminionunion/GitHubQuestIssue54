// server/index.ts

// DIAGNOSTIC: patch path-to-regexp.parse to log its input before it throws.
// Place this before importing modules that might invoke path-to-regexp.
try {
  // Use require so this works both when compiled and during local dev
  // (path-to-regexp may be CJS in node_modules).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const p2r = require('path-to-regexp');
  if (p2r && typeof p2r.parse === 'function') {
    const origParse = p2r.parse;
    p2r.parse = function (str: any, options: any) {
      try {
        // log up to 2000 chars so we capture long values without flooding logs
        console.log('P2R PARSE INPUT >>>', String(str).slice(0, 2000));
      } catch (e) {
        console.log('P2R PARSE INPUT (failed to stringify)', e);
      }
      return origParse.call(this, str, options);
    };
    console.log('P2R parse patched for diagnostic logging');
  }
} catch (e) {
  console.log('P2R patch failed (module may load later)', e);
}

import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import type { Pantry } from './types.js';
import type { Express } from 'express';

dotenv.config();

const app = express();

/**
 * DIAGNOSTIC: install mount logging to capture every app.use / app.METHOD call
 * and print a short stack so we can identify the caller when a bad mount value
 * is passed to express / path-to-regexp.
 */
function installMountLogging(appInstance: Express) {
  const origUse = appInstance.use.bind(appInstance);
  (appInstance as any).use = function (...args: any[]) {
    try {
      const first = args[0];
      const mountInfo = typeof first === 'string' ? first : (first && first.name) || typeof first;
      console.log(`DEBUG MOUNT: app.use called with first arg = ${JSON.stringify(mountInfo)}`);
      const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
      console.log('DEBUG MOUNT STACK:\n' + stack);
    } catch (e) {
      console.log('DEBUG MOUNT: failed to log mount args', e);
    }
    return origUse(...args);
  };

  const methodsToWrap = ['get', 'post', 'put', 'delete', 'patch', 'all'] as const;
  for (const m of methodsToWrap) {
    const orig = (appInstance as any)[m].bind(appInstance);
    (appInstance as any)[m] = function (pathOrHandler: any, ...rest: any[]) {
      try {
        const info = typeof pathOrHandler === 'string' ? pathOrHandler : (pathOrHandler && pathOrHandler.name) || typeof pathOrHandler;
        console.log(`DEBUG ROUTE: app.${m} called with first arg = ${JSON.stringify(info)}`);
        const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
        console.log('DEBUG ROUTE STACK:\n' + stack);
      } catch (e) {
        console.log(`DEBUG ROUTE: failed to log for app.${m}`, e);
      }
      return orig(pathOrHandler, ...rest);
    };
  }
}

installMountLogging(app);

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

const BASE_PATH_RAW = process.env.BASE_PATH || process.env.BASE_URL;
const BASE_PATH = normalizeBasePath(BASE_PATH_RAW);

// Informational logs for debugging mount values
console.log(`Using raw BASE_PATH/BASE_URL = "${BASE_PATH_RAW ?? ''}"`);
console.log(`Using normalized BASE_PATH = "${BASE_PATH}"`);

/**
 * Mount API routes under BASE_PATH so app can run behind a reverse-proxy with a path prefix.
 * If no BASE_PATH is set, this is simply '/' and behavior is unchanged.
 */
const router = express.Router();

// ========== PRIMARY DATABASE ENDPOINTS (uminiondb) ==========

router.get('/api/uminiondb/users', async (req, res) => {
  try {
    const connection = await getUminionConnection();
    const [users] = await connection.query('SELECT * FROM users LIMIT 100');
    connection.release();
    res.json(users);
  } catch (error) {
    console.error('Error fetching from uminiondb:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ========== PANTRY DATABASE ENDPOINTS (dbFindApantry) ==========

// Get all pantries
router.get('/api/pantries', async (req, res) => {
  try {
    const connection = await getPantryConnection();
    const [pantries] = await connection.query(
      'SELECT id, name, address, city, state, zip_code, latitude, longitude, phone, email, website FROM pantries WHERE is_active = TRUE'
    );
    connection.release();
    res.json(pantries);
  } catch (error) {
    console.error('Error fetching pantries:', error);
    res.status(500).json({ error: 'Failed to fetch pantries' });
  }
});

// Get single pantry by ID
router.get('/api/pantries/:id', async (req, res) => {
  try {
    const connection = await getPantryConnection();
    const [pantries] = await connection.query(
      'SELECT * FROM pantries WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (Array.isArray(pantries) && pantries.length === 0) {
      res.status(404).json({ error: 'Pantry not found' });
      return;
    }

    res.json(Array.isArray(pantries) ? pantries[0] : null);
  } catch (error) {
    console.error('Error fetching pantry:', error);
    res.status(500).json({ error: 'Failed to fetch pantry' });
  }
});

// Add new pantry
router.post('/api/pantries', async (req, res) => {
  try {
    const { name, address, city, state, zip_code, latitude, longitude, phone, email, website, hours_of_operation, description, services, requirements } = req.body;

    const connection = await getPantryConnection();
    await connection.query(
      'INSERT INTO pantries (name, address, city, state, zip_code, latitude, longitude, phone, email, website, hours_of_operation, description, services, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, state, zip_code, latitude, longitude, phone, email, website, hours_of_operation, description, services, requirements]
    );
    connection.release();

    res.status(201).json({ message: 'Pantry created successfully' });
  } catch (error) {
    console.error('Error creating pantry:', error);
    res.status(500).json({ error: 'Failed to create pantry' });
  }
});

// Update pantry
router.put('/api/pantries/:id', async (req, res) => {
  try {
    const { name, address, city, state, zip_code, latitude, longitude, phone, email, website, hours_of_operation, description, services, requirements } = req.body;

    const connection = await getPantryConnection();
    await connection.query(
      'UPDATE pantries SET name = ?, address = ?, city = ?, state = ?, zip_code = ?, latitude = ?, longitude = ?, phone = ?, email = ?, website = ?, hours_of_operation = ?, description = ?, services = ?, requirements = ? WHERE id = ?',
      [name, address, city, state, zip_code, latitude, longitude, phone, email, website, hours_of_operation, description, services, requirements, req.params.id]
    );
    connection.release();

    res.json({ message: 'Pantry updated successfully' });
  } catch (error) {
    console.error('Error updating pantry:', error);
    res.status(500).json({ error: 'Failed to update pantry' });
  }
});

// Delete pantry
router.delete('/api/pantries/:id', async (req, res) => {
  try {
    const connection = await getPantryConnection();
    await connection.query('DELETE FROM pantries WHERE id = ?', [req.params.id]);
    connection.release();

    res.json({ message: 'Pantry deleted successfully' });
  } catch (error) {
    console.error('Error deleting pantry:', error);
    res.status(500).json({ error: 'Failed to delete pantry' });
  }
});

// ========== POLITICIAN DATABASE ENDPOINTS (dbUnionPolitic) ==========

// Get all politicians
router.get('/api/politicians', async (req, res) => {
  try {
    const connection = await getPoliticConnection();
    const [politicians] = await connection.query(
      'SELECT id, first_name, last_name, email, phone, office_seeking, district, city, state, website FROM politicians WHERE is_verified = TRUE'
    );
    connection.release();
    res.json(politicians);
  } catch (error) {
    console.error('Error fetching politicians:', error);
    res.status(500).json({ error: 'Failed to fetch politicians' });
  }
});

// Get politician by ID
router.get('/api/politicians/:id', async (req, res) => {
  try {
    const connection = await getPoliticConnection();
    const [politicians] = await connection.query(
      'SELECT * FROM politicians WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (Array.isArray(politicians) && politicians.length === 0) {
      res.status(404).json({ error: 'Politician not found' });
      return;
    }

    res.json(Array.isArray(politicians) ? politicians[0] : null);
  } catch (error) {
    console.error('Error fetching politician:', error);
    res.status(500).json({ error: 'Failed to fetch politician' });
  }
});

// Register new politician
router.post('/api/politicians', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, office_seeking, district, city, state, bio, website, social_media_twitter, social_media_facebook, social_media_instagram } = req.body;

    const connection = await getPoliticConnection();
    await connection.query(
      'INSERT INTO politicians (first_name, last_name, email, phone, office_seeking, district, city, state, bio, website, social_media_twitter, social_media_facebook, social_media_instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, office_seeking, district, city, state, bio, website, social_media_twitter, social_media_facebook, social_media_instagram]
    );
    connection.release();

    res.status(201).json({ message: 'Politician registered successfully' });
  } catch (error) {
    console.error('Error registering politician:', error);
    res.status(500).json({ error: 'Failed to register politician' });
  }
});

// Get unverified politicians
router.get('/api/politicians/unverified/all', async (req, res) => {
  try {
    const connection = await getPoliticConnection();
    const [politicians] = await connection.query(
      'SELECT * FROM politicians WHERE is_verified = FALSE'
    );
    connection.release();
    res.json(politicians);
  } catch (error) {
    console.error('Error fetching unverified politicians:', error);
    res.status(500).json({ error: 'Failed to fetch unverified politicians' });
  }
});

// ========== GEOCODING ENDPOINT (unchanged) ==========

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

// ========== SQLite Fallback Endpoints (optional) ==========

router.get('/api/pantries-sqlite', async (req, res) => {
  try {
    const pantries = await db.selectFrom('pantries').selectAll().where('deleted', '=', 0).execute();
    res.json(pantries);
  } catch (error) {
    console.error('Failed to get pantries from SQLite:', error);
    res.status(500).json({ message: 'Failed to retrieve pantries' });
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

/**
 * Safe mount helper: tries to mount at a sanitized path and falls back to root on error.
 * Also logs the final mount path so startup reveals where handlers were attached.
 */
function safeMount(appInstance: Express, maybePath: string | undefined, handler: any) {
  const normalized = normalizeBasePath(maybePath);
  try {
    console.log(`Attempting to mount handler at "${normalized}"`);
    appInstance.use(normalized, handler);
    console.log(`Mounted handler at "${normalized}"`);
  } catch (err) {
    console.error(`safeMount: failed to mount handler at "${normalized}", mounting at "/" instead`, err);
    try {
      appInstance.use('/', handler);
      console.log(`Mounted handler at "/" as fallback`);
    } catch (err2) {
      console.error('safeMount: fallback mount at "/" also failed', err2);
      throw err2;
    }
  }
}

// Use safeMount so malformed values cannot crash path-to-regexp at startup
safeMount(app, BASE_PATH_RAW, router);

// Export a function to start the server
export async function startServer(port: number | string = process.env.PORT || 3001) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // static serving will ignore API paths; setupStaticServing expects the app root, it uses __dirname logic
      try {
        setupStaticServing(app);
      } catch (err) {
        console.error('setupStaticServing failed at startup (caught):', err);
        // Continue so server still starts; logs will show the error.
      }
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
