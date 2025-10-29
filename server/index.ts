
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import { Candidate, Pantry } from './types.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Geocoding helper
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const geoResponse = await fetch(url, {
      headers: { 'User-Agent': 'PantryFinderApp/1.0' }
    });
    if (!geoResponse.ok) throw new Error(`Nominatim API failed with status: ${geoResponse.status}`);
    const geoData = await geoResponse.json();
    if (geoData && geoData.length > 0) {
      const { lat, lon } = geoData[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

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
    
    // Add a second senator for each state for demonstration purposes
    const senators = politicians.filter(p => p.office === 'Senate');
    const senatorsByState = senators.reduce((acc, senator) => {
      if (!acc[senator.state]) {
        acc[senator.state] = [];
      }
      acc[senator.state].push(senator);
      return acc;
    }, {});

    const additionalSenators = [];
    Object.values(senatorsByState).forEach((senatorList: any[]) => {
      if (senatorList.length === 1) {
        const existingSenator = senatorList[0];
        const newSenator = {
          ...existingSenator,
          id: existingSenator.id + 1000, // Avoid ID collision
          name: `Senator for ${existingSenator.state} 2`,
          lat: existingSenator.lat + 0.1, // Offset to avoid marker overlap
          lng: existingSenator.lng + 0.1,
        };
        additionalSenators.push(newSenator);
      }
    });

    res.json([...politicians, ...additionalSenators]);
  } catch (error) {
    console.error('Failed to get politicians:', error);
    res.status(500).json({ message: 'Failed to retrieve politicians' });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.selectFrom('candidates').selectAll().where('show_on_map', '=', 1).execute();
    res.json(candidates);
  } catch (error) {
    console.error('Failed to get candidates:', error);
    res.status(500).json({ message: 'Failed to retrieve candidates' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const { name, country, state, office_type, website, phone, show_on_map } = req.body;

    let coords = null;
    if (show_on_map) {
      coords = await geocodeLocation(`${state}, ${country}`);
    }

    const newCandidate: Omit<Candidate, 'id'> = {
      name,
      country,
      state,
      office: office_type?.includes('Senate') ? 'Senate' : 'House', // Simplified
      office_type,
      website,
      phone,
      show_on_map,
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      district: null,
      party: '',
    };

    const result = await db.insertInto('candidates')
      .values(newCandidate)
      .returningAll()
      .executeTakeFirstOrThrow();
      
    res.status(201).json(result);
  } catch (error) {
    console.error('Failed to add candidate:', error);
    res.status(500).json({ message: 'Failed to add candidate' });
  }
});

app.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ message: 'Address is required' });
    return;
  }
  
  const coords = await geocodeLocation(address);

  if (coords) {
    res.json(coords);
  } else {
    res.status(404).json({ message: 'Coordinates not found' });
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
