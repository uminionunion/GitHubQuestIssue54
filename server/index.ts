
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import { Pantry } from './types.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.get('/api/pantries', async (req, res) => {
  try {
    const pantries = await db.selectFrom('pantries').selectAll().where('deleted', '=', 0).execute();
    res.json(pantries);
  } catch (error) {
    console.error('Failed to get pantries:', error);
    res.status(500).json({ message: 'Failed to retrieve pantries' });
  }
});

app.post('/api/pantries', async (req, res) => {
  try {
    const newPantry: Omit<Pantry, 'id' | 'deleted'> = req.body;
    const result = await db.insertInto('pantries').values({ ...newPantry, deleted: 0 }).returningAll().executeTakeFirstOrThrow();
    res.status(201).json(result);
  } catch (error) {
    console.error('Failed to add pantry:', error);
    res.status(500).json({ message: 'Failed to add pantry' });
  }
});

app.get('/api/politicians', async (req, res) => {
  try {
    const politicians = await db.selectFrom('politicians').selectAll().execute();
    res.json(politicians);
  } catch (error) {
    console.error('Failed to get politicians:', error);
    res.status(500).json({ message: 'Failed to retrieve politicians' });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.selectFrom('candidates').selectAll().execute();
    res.json(candidates);
  } catch (error) {
    console.error('Failed to get candidates:', error);
    res.status(500).json({ message: 'Failed to retrieve candidates' });
  }
});

app.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ message: 'Address is required' });
    return;
  }
  
  // Using OpenStreetMap Nominatim for geocoding.
  // It's free but has usage policies. For production, consider a dedicated service.
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const geoResponse = await fetch(url, {
      headers: {
        'User-Agent': 'PantryFinderApp/1.0' // Nominatim requires a User-Agent
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


// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
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
