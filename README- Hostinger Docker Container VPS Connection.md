# Multi-Database Docker Setup for Hostinger VPS
## Connecting to uminiondb, dbFindApantry, and dbUnionPolitic

This unified guide explains how to properly configure your "Find a Pantry" application (`unionsupport13findapantrybuttonv001` container) to access **ALL THREE** databases (uminiondb, dbFindApantry, dbUnionPolitic) running in the `uminionmysql` container on Hostinger VPS.

---

## The Database Question Explained

### Why Three Databases?

Your Hostinger VPS has been running with `uminiondb` for an extended period and contains important existing data that needs to be accessible. The new "Find a Pantry" and politician features require separate databases.

**Current State:**
- **uminiondb** - Existing database with critical information (users, settings, etc.) - PRIMARY
- **dbFindApantry** - New database for pantry listings and locations
- **dbUnionPolitic** - New database for politician information

**MySQL Container (uminionmysql)**: Hosts ALL three databases
**Your App (unionsupport13findapantrybuttonv001)**: Needs access to all three

### Why Not Just Use uminiondb?

While you could store everything in `uminiondb`, separating concerns (existing data in `uminiondb`, pantries in `dbFindApantry`, politicians in `dbUnionPolitic`) provides:
1. **Clear organization** - Each feature owns its database
2. **Easier backups** - Back up one feature without affecting others
3. **Scalability** - Move databases to separate servers later if needed
4. **Team collaboration** - Different teams can manage different databases
5. **Data preservation** - Original `uminiondb` is protected and unchanged

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            Hostinger VPS Network (uminionnet)       │
├─────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────┐   ┌─────────────────┐   │
│  │   MySQL 5.7 Container│   │   App Container │   │
│  │  (uminionmysql)      │   │   (Node.js/     │   │
│  │                      │   │   React)        │   │
│  │ ┌────────────────┐   │   │                 │   │
│  │ │  uminiondb     │   │   │ Needs access:  │   │
│  │ │ (EXISTING DATA)│◄──┼───┤ • uminiondb    │   │
│  │ │                │   │   │ • dbFindApantry│   │
│  │ ├────────────────┤   │   │ • dbUnionPolitic   │
│  │ │ dbFindApantry  │   │   │                 │   │
│  │ │ (new pantries) │◄──┼───┤                 │   │
│  │ │                │   │   │                 │   │
│  │ ├────────────────┤   │   │                 │   │
│  │ │ dbUnionPolitic │   │   │                 │   │
│  │ │ (politicians)  │◄──┼───┤                 │   │
│  │ │                │   │   │                 │   │
│  │ └────────────────┘   │   │                 │   │
│  │                      │   └─────────────────┘   │
│  └──────────────────────┘                         │
│                                                     │
└─────────────────────────────────────────────────┘
```

---

## Step 1: Verify MySQL Container Configuration

Your MySQL container (uminionmysql) docker-compose.yml should include the original `uminiondb`:

```yaml
version: "3.9"

services:
  uminionmysql:
    image: mysql:5.7
    container_name: container_uminionmysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: (your-mysql-root-password)
      # ⚠️ CRITICAL: Set to uminiondb to preserve existing data
      MYSQL_DATABASE: uminiondb
      MYSQL_USER: app_user
      MYSQL_PASSWORD: (your-app-password)
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - uminionnet

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - "8080:80"
    environment:
      PMA_HOST: uminionmysql
      PMA_USER: root
      PMA_PASSWORD: (your-mysql-root-password)
    networks:
      - uminionnet

volumes:
  db_data:

networks:
  uminionnet:
    external: true
```

**Key Points:**
- `MYSQL_DATABASE: uminiondb` - Creates/preserves the original database on startup
- Both `dbFindApantry` and `dbUnionPolitic` will be created when your app initializes them
- `db_data` volume persists all three databases across container restarts
- This ensures backward compatibility with existing data

---

## Step 2: Application Container Configuration

Your application container (unionsupport13findapantrybuttonv001) docker-compose.yml:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATA_DIRECTORY: /app/data/
      
      # MySQL Connection Settings (same for all databases)
      DB_HOST: uminionmysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: (your-mysql-root-password)
      
      # Three database names (all on same MySQL server)
      # ⚠️ IMPORTANT: DB_NAME is uminiondb (primary)
      DB_NAME: uminiondb                    # PRIMARY existing database
      DB_NAME_PANTRY: dbFindApantry         # NEW pantries database
      DB_NAME_POLITIC: dbUnionPolitic       # NEW politicians database
      
    volumes:
      - app_data:/app/data/
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - uminionnet

volumes:
  app_data:
    driver: local

networks:
  uminionnet:
    external: true
```

**Key Points:**
- `DB_HOST: uminionmysql` - Container DNS name, Docker resolves to MySQL container
- `DB_NAME: uminiondb` - Primary database (existing data)
- `DB_NAME_PANTRY`, `DB_NAME_POLITIC` - Additional databases
- All three databases live on the same MySQL server
- Single connection configuration (one host, port, user, password)

---

## Step 3: Create Network on Hostinger VPS

If the network doesn't exist yet, create it via SSH:

```bash
ssh root@YOUR_VPS_IP
docker network create uminionnet
docker network ls  # Verify it was created
```

---

## Step 4: Create Connection Pools for All Three Databases

**Create/Update file**: `server/db-mysql.ts`

```typescript
import mysql from 'mysql2/promise';

console.log('MySQL Connection Settings:');
console.log(`  Host: ${process.env.DB_HOST || 'uminionmysql'}`);
console.log(`  Port: ${process.env.DB_PORT || '3306'}`);
console.log(`  User: ${process.env.DB_USER || 'root'}`);
console.log(`  Primary DB (uminiondb): ${process.env.DB_NAME || 'uminiondb'}`);
console.log(`  Pantry DB: ${process.env.DB_NAME_PANTRY || 'dbFindApantry'}`);
console.log(`  Politic DB: ${process.env.DB_NAME_POLITIC || 'dbUnionPolitic'}`);

// Connection pool for existing uminiondb (PRIMARY)
let uminionPool: mysql.Pool | null = null;

// Connection pool for new pantry database
let pantryPool: mysql.Pool | null = null;

// Connection pool for politician database
let politicPool: mysql.Pool | null = null;

try {
  uminionPool = mysql.createPool({
    host: process.env.DB_HOST || 'uminionmysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'uminiondb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  console.log('✓ Primary database connection pool created (uminiondb)');
} catch (err) {
  console.error('✗ Failed to create primary database connection pool:', err);
}

try {
  pantryPool = mysql.createPool({
    host: process.env.DB_HOST || 'uminionmysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PANTRY || 'dbFindApantry',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  console.log('✓ Pantry database connection pool created (dbFindApantry)');
} catch (err) {
  console.error('✗ Failed to create pantry connection pool:', err);
}

try {
  politicPool = mysql.createPool({
    host: process.env.DB_HOST || 'uminionmysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_POLITIC || 'dbUnionPolitic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  console.log('✓ Politician database connection pool created (dbUnionPolitic)');
} catch (err) {
  console.error('✗ Failed to create politician connection pool:', err);
}

// Export getters for each database
export const getUminionConnection = async () => {
  if (!uminionPool) {
    throw new Error('Primary database (uminiondb) connection pool not initialized');
  }
  return uminionPool.getConnection();
};

export const getPantryConnection = async () => {
  if (!pantryPool) {
    throw new Error('Pantry database (dbFindApantry) connection pool not initialized');
  }
  return pantryPool.getConnection();
};

export const getPoliticConnection = async () => {
  if (!politicPool) {
    throw new Error('Politician database (dbUnionPolitic) connection pool not initialized');
  }
  return politicPool.getConnection();
};
```

---

## Step 5: Create Databases and Tables Using phpMyAdmin

### Access phpMyAdmin

1. Go to: `http://your-vps-ip:8080`
2. Login with:
   - **Username**: `root`
   - **Password**: (your MySQL root password)

### Verify uminiondb Exists

The `uminiondb` database should already exist with your original data from the MySQL container startup.

If it doesn't exist, you'll need to restore it from a backup:
```bash
docker exec -i container_uminionmysql mysql -u root -p<password> < /path/to/uminiondb_backup.sql
```

### Create Database: dbFindApantry

1. Click **New** at the bottom left
2. Enter database name: `dbFindApantry`
3. Click **Create**
4. Click on `dbFindApantry` to select it
5. Go to the **SQL** tab
6. Run this SQL:

```sql
-- Pantries Table
CREATE TABLE IF NOT EXISTS pantries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  hours_of_operation VARCHAR(500),
  description TEXT,
  services TEXT,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_city (city),
  INDEX idx_state (state),
  INDEX idx_location (latitude, longitude)
);

-- Pantry Items Table
CREATE TABLE IF NOT EXISTS pantry_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pantry_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity_available INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pantry_id) REFERENCES pantries(id) ON DELETE CASCADE
);

-- Pantry Reviews Table
CREATE TABLE IF NOT EXISTS pantry_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pantry_id INT NOT NULL,
  reviewer_name VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pantry_id) REFERENCES pantries(id) ON DELETE CASCADE
);
```

### Create Database: dbUnionPolitic

1. Click **New** at the bottom left
2. Enter database name: `dbUnionPolitic`
3. Click **Create**
4. Click on `dbUnionPolitic` to select it
5. Go to the **SQL** tab
6. Run this SQL:

```sql
-- Politicians Table
CREATE TABLE IF NOT EXISTS politicians (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  office_seeking VARCHAR(255),
  district VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  bio TEXT,
  website VARCHAR(255),
  social_media_twitter VARCHAR(255),
  social_media_facebook VARCHAR(255),
  social_media_instagram VARCHAR(255),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_state (state),
  INDEX idx_office (office_seeking)
);

-- Politician Endorsements Table
CREATE TABLE IF NOT EXISTS politician_endorsements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  endorsement_source VARCHAR(255),
  endorsement_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
);

-- Politician Events Table
CREATE TABLE IF NOT EXISTS politician_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_date DATETIME,
  event_location VARCHAR(255),
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
);
```

---

## Step 6: Update Express API Routes

**Update file**: `server/index.ts`

Add these routes to access all three databases:

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import { Pantry } from './types.js';
import { 
  getUminionConnection, 
  getPantryConnection, 
  getPoliticConnection 
} from './db-mysql.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== PRIMARY DATABASE ENDPOINTS (uminiondb) ==========

app.get('/api/uminiondb/users', async (req, res) => {
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
app.get('/api/pantries', async (req, res) => {
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
app.get('/api/pantries/:id', async (req, res) => {
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
app.post('/api/pantries', async (req, res) => {
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
app.put('/api/pantries/:id', async (req, res) => {
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
app.delete('/api/pantries/:id', async (req, res) => {
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
app.get('/api/politicians', async (req, res) => {
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
app.get('/api/politicians/:id', async (req, res) => {
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
app.post('/api/politicians', async (req, res) => {
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
app.get('/api/politicians/unverified/all', async (req, res) => {
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

// ========== SQLite Fallback Endpoints ==========

app.get('/api/pantries-sqlite', async (req, res) => {
  try {
    const pantries = await db.selectFrom('pantries').selectAll().where('deleted', '=', 0).execute();
    res.json(pantries);
  } catch (error) {
    console.error('Failed to get pantries from SQLite:', error);
    res.status(500).json({ message: 'Failed to retrieve pantries' });
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

export default app;
```

---

## Step 7: Deploy to Hostinger VPS

### SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

### Navigate to deployment directory:

```bash
cd /home/deploy/food-pantry-finder
```

### Update docker-compose.yml with ALL three databases:

Ensure your application's docker-compose.yml includes:

```yaml
environment:
  NODE_ENV: production
  PORT: 4000
  DATA_DIRECTORY: /app/data/
  DB_HOST: uminionmysql
  DB_PORT: 3306
  DB_USER: root
  DB_PASSWORD: your-mysql-root-password
  DB_NAME: uminiondb                    # Primary existing database
  DB_NAME_PANTRY: dbFindApantry         # New pantries database
  DB_NAME_POLITIC: dbUnionPolitic       # New politicians database
```

### Pull and deploy:

```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

### View logs:

```bash
docker-compose logs -f app
```

---

## Step 8: Verify All Three Databases Are Accessible

### Test primary database (uminiondb):

```bash
curl http://your-vps-ip:4000/api/uminiondb/users
```

### Test pantry database (dbFindApantry):

```bash
curl http://your-vps-ip:4000/api/pantries
```

### Test politician database (dbUnionPolitic):

```bash
curl http://your-vps-ip:4000/api/politicians
```

---

## Step 9: Backup Strategy for Multi-Database Setup

### Backup all databases:

```bash
ssh root@YOUR_VPS_IP

# Backup all databases from MySQL container
docker exec container_uminionmysql mysqldump -u root -p$(docker exec container_uminionmysql echo $MYSQL_ROOT_PASSWORD) --all-databases > /home/deploy/all_databases_backup_$(date +%Y%m%d).sql
```

### Backup individual databases:

```bash
# Backup only uminiondb (PRIMARY - most important)
docker exec container_uminionmysql mysqldump -u root -p<password> uminiondb > uminiondb_backup.sql

# Backup only dbFindApantry
docker exec container_uminionmysql mysqldump -u root -p<password> dbFindApantry > dbFindApantry_backup.sql

# Backup only dbUnionPolitic
docker exec container_uminionmysql mysqldump -u root -p<password> dbUnionPolitic > dbUnionPolitic_backup.sql
```

### Restore a specific database:

```bash
# Restore uminiondb (primary)
docker exec -i container_uminionmysql mysql -u root -p<password> uminiondb < uminiondb_backup.sql
```

---

## Troubleshooting Multi-Database Issues

### Error: "Unknown database"

```bash
# Check which databases exist in MySQL
docker exec -it container_uminionmysql mysql -u root -p<password> -e "SHOW DATABASES;"
```

Expected output should show: `uminiondb`, `dbFindApantry`, `dbUnionPolitic`

### Error: "Access denied for user"

Verify passwords match in both docker-compose files:
- Application: `DB_PASSWORD`
- MySQL: `MYSQL_ROOT_PASSWORD`

They **MUST** be identical.

### Error: "Connection refused"

Verify both containers are on the same network:

```bash
docker network inspect uminionnet
```

You should see both `container_uminionmysql` and your app container listed.

### Connection Pools Not Initializing

Check logs for detailed error messages:

```bash
docker-compose logs app | grep -i "connection pool"
```

---

## Summary: What This Configuration Provides

| Item | Details |
|------|---------|
| **Database Count** | 3 databases on 1 MySQL server |
| **Database Names** | uminiondb (PRIMARY), dbFindApantry, dbUnionPolitic |
| **Primary DB** | `uminiondb` - preserves existing data |
| **Connection Pools** | 3 separate pools for simultaneous access |
| **Network** | uminionnet for inter-container communication |
| **Backup** | All three databases together or individually |
| **Scaling** | Easy to move databases to separate servers |

---

## Key Points to Remember

1. **One MySQL Server, Three Databases** - All databases live on `uminionmysql` container
2. **DB_NAME is uminiondb** - Primary database with existing critical data
3. **Environment Variables** - Separate `DB_NAME_*` variables tell app which database to use
4. **Connection Pools** - Three pools allow simultaneous access to all databases
5. **Data Preservation** - Original `uminiondb` is protected and unchanged
6. **Docker Network** - Both containers MUST be on `uminionnet` to communicate
7. **Backward Compatibility** - Existing applications can still access `uminiondb`

---

## File Summary

| File | Purpose |
|------|---------|
| `server/db-mysql.ts` | Three connection pools (uminiondb, pantry, politic) |
| `server/index.ts` | API routes for all three databases |
| Docker Compose (App) | Environment variables for all three databases |
| Docker Compose (MySQL) | `MYSQL_DATABASE: uminiondb` to preserve existing data |

This unified configuration ensures your application has seamless access to legacy data while enabling the new pantry and politician features on a single, well-organized MySQL server.
