# Database & Backend Connection Guide

This guide covers how to connect this application to different databases and backend architectures: Express (default), SQLite, MySQL, Docker containers, and Docker volumes.

---

## Table of Contents

1. [Express Backend Connection](#express-backend-connection)
2. [SQLite Database Connection](#sqlite-database-connection)
3. [MySQL Database Connection](#mysql-database-connection)
4. [Docker Container Networking](#docker-container-networking)
5. [Docker Volumes & Data Persistence](#docker-volumes--data-persistence)

---

## Express Backend Connection

### Current Setup

The application currently uses **Express 5.x** as the backend server with the following configuration:

**File:** `server/index.ts`

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';

dotenv.config();
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.get('/api/pantries', async (req, res) => {
  // ... endpoint logic
});
```

### Port Configuration

```bash
# Development
NODE_ENV=development
PORT=3001          # API server
# Frontend runs on port 3000 (Vite dev server)

# Production
NODE_ENV=production
PORT=4000          # Both API and static files served on same port
```

### Frontend to Backend Communication

**File:** `client/src/` (any component)

```typescript
// Fetch data from Express API
const response = await fetch('/api/pantries');
const data = await response.json();

// In development: Uses Vite proxy configured in vite.config.js
// In production: Express serves both frontend and API on port 4000
```

### Development Server Setup

**File:** `scripts/dev.ts` (run with `npm start`)

```bash
# Starts both:
# - Vite dev server (frontend) on port 3000
# - Express API server on port 3001
npm start
```

### Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pantries` | GET | Retrieve all food pantries |
| `/api/pantries` | POST | Create a new food pantry |
| `/api/politicians` | GET | Retrieve all politicians |
| `/api/candidates` | GET | Retrieve all candidates |
| `/api/geocode` | GET | Geocode address to coordinates |

### Adding New Express Routes

To add a new API endpoint:

**File:** `server/index.ts`

```typescript
app.post('/api/my-endpoint', async (req, res) => {
  try {
    const data = req.body;
    // Process data
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});
```

---

## SQLite Database Connection

### Current Setup

The application uses **SQLite 3.0+** with the **Kysely** query builder.

**File:** `server/db.ts`

```typescript
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';

const dialect = new SqliteDialect({
  database: new Database('./data/database.sqlite'),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
```

### Database Location

```
/home/app/data/database.sqlite       # Main database file
/home/app/data/database.sqlite-shm   # Shared memory file
/home/app/data/database.sqlite-wal   # Write-ahead log file
```

### Database Schema

**File:** `server/db.ts` (DatabaseSchema interface)

Three tables are currently defined:

#### 1. Pantries Table

```sql
CREATE TABLE pantries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  hours TEXT,
  type TEXT CHECK(type IN ('food', 'clothing', 'resource', 'library')),
  repeating TEXT CHECK(repeating IN ('one-time', 'daily', 'weekly', 'weekendly', 'monthly', 'idk')),
  deleted INTEGER DEFAULT 0
);
```

#### 2. Politicians Table

```sql
CREATE TABLE politicians (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  office TEXT CHECK(office IN ('House', 'Senate')),
  state TEXT NOT NULL,
  district INTEGER,
  party TEXT NOT NULL,
  term_end_date TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL
);
```

#### 3. Candidates Table

```sql
CREATE TABLE candidates (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  office TEXT CHECK(office IN ('House', 'Senate')),
  state TEXT NOT NULL,
  district INTEGER,
  party TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL
);
```

### Querying SQLite with Kysely

**Example: Get all pantries**

```typescript
const pantries = await db
  .selectFrom('pantries')
  .selectAll()
  .where('deleted', '=', 0)
  .execute();
```

**Example: Insert new pantry**

```typescript
const result = await db
  .insertInto('pantries')
  .values({
    name: 'Main Food Pantry',
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.0060,
    deleted: 0
  })
  .returningAll()
  .executeTakeFirstOrThrow();
```

### Backing Up SQLite

```bash
# Create backup
cp /home/app/data/database.sqlite /backups/database.sqlite.backup

# Restore from backup
cp /backups/database.sqlite.backup /home/app/data/database.sqlite
```

### Adding New Tables/Migrations

To add a new table, use the `database_migration` tool:

```typescript
// Example migration
const migrationScript = `
CREATE TABLE IF NOT EXISTS new_table (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// This will execute the migration
database_migration(migrationScript, "Create new_table");
```

---

## MySQL Database Connection

### Installation

If you want to switch from SQLite to MySQL, follow these steps:

#### Step 1: Install MySQL Driver

```bash
npm install mysql2 dotenv
npm install --save-dev @types/mysql2
```

#### Step 2: Update Database Configuration

**File:** `server/db.ts` (Replace entire file)

```typescript
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';
import { Pantry, Politician, Candidate } from './types';

interface DatabaseSchema {
  pantries: PantryTable;
  politicians: PoliticianTable;
  candidates: CandidateTable;
}

interface PantryTable {
  id: number;
  name: string;
  address: string;
  notes: string | null;
  lat: number;
  lng: number;
  hours: string | null;
  type: 'food' | 'clothing' | 'resource' | 'library';
  repeating: 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';
  deleted: 0 | 1;
}

interface PoliticianTable {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  term_end_date: string | null;
  lat: number;
  lng: number;
}

interface CandidateTable {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  lat: number;
  lng: number;
}

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_pantry_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const dialect = new MysqlDialect({
  pool: pool.promise(),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
```

#### Step 3: Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE food_pantry_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_pantry_db;

# Create tables
CREATE TABLE pantries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  hours VARCHAR(255),
  type ENUM('food', 'clothing', 'resource', 'library') NOT NULL,
  repeating ENUM('one-time', 'daily', 'weekly', 'weekendly', 'monthly', 'idk') NOT NULL,
  deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deleted (deleted),
  INDEX idx_coordinates (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE politicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  office ENUM('House', 'Senate') NOT NULL,
  state VARCHAR(2) NOT NULL,
  district INT,
  party VARCHAR(100) NOT NULL,
  term_end_date DATE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_office (office),
  INDEX idx_state (state),
  INDEX idx_coordinates (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  office ENUM('House', 'Senate') NOT NULL,
  state VARCHAR(2) NOT NULL,
  district INT,
  party VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_office (office),
  INDEX idx_state (state),
  INDEX idx_coordinates (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Step 4: Update Environment Variables

**File:** `.env`

```
NODE_ENV=production
PORT=4000
DATA_DIRECTORY=/home/app/data/

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=food_pantry_db
DB_PORT=3306
```

#### Step 5: Backup and Restore MySQL Data

```bash
# Backup
mysqldump -u root -p food_pantry_db > backup.sql

# Restore
mysql -u root -p food_pantry_db < backup.sql

# Backup all databases
mysqldump -u root -p --all-databases > full_backup.sql

# Remote backup (over SSH)
ssh user@remote-server "mysqldump -u root -p food_pantry_db" > remote_backup.sql
```

#### Step 6: Docker Compose with MySQL

**File:** `docker-compose.yml` (with MySQL)

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
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root_password
      DB_NAME: food_pantry_db
      DB_PORT: 3306
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: food_pantry_db
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  mysql_data:
    driver: local
```

---

## Docker Container Networking

### Connecting Multiple Containers

#### Scenario: App container + Database container

When using Docker Compose, containers are automatically networked through a custom bridge network.

**Key Points:**

- **Container DNS**: Containers can communicate using the service name as the hostname
- **Port Mapping**: Use the internal port (not the mapped port) when containers communicate
- **Network Name**: Default network is `<project-directory>_default`

### Example: App Container talking to MySQL Container

**docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      # Use service name 'mysql' as hostname
      DB_HOST: mysql
      DB_PORT: 3306  # Internal port (not the mapped 3306:3306)
      DB_USER: root
      DB_PASSWORD: mypassword
      DB_NAME: food_pantry_db
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: mypassword
      MYSQL_DATABASE: food_pantry_db
    ports:
      - "3306:3306"  # Maps to host, not used by app container
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
```

### Connecting to External Services

If your database is running on a different host:

**File:** `.env`

```
# If MySQL is on a separate server
DB_HOST=192.168.1.100
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=food_pantry_db

# If connecting to a remote machine
DB_HOST=db.example.com
DB_PORT=3306
```

### Debugging Container Networking

```bash
# Check if containers can reach each other
docker-compose exec app ping mysql

# View container IP addresses
docker inspect -f '{{.Name}} {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

# Check container logs
docker-compose logs app
docker-compose logs mysql

# Exec into container and test connection
docker-compose exec mysql mysql -u root -p<password> -h 127.0.0.1 food_pantry_db

# View network details
docker network inspect <network-name>
```

---

## Docker Volumes & Data Persistence

### What are Volumes?

Docker volumes provide persistent storage that survives container deletion. They allow:
- Data to persist between container restarts
- Data sharing between containers
- Better performance than bind mounts

### Current Application Volume Setup

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    volumes:
      - app_data:/app/data  # Named volume for SQLite database
    environment:
      DATA_DIRECTORY: /app/data/
    restart: unless-stopped

volumes:
  app_data:
    driver: local
```

### Volume Types

#### 1. Named Volumes (Recommended)

```yaml
volumes:
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /home/app/data

services:
  app:
    volumes:
      - app_data:/app/data
```

**Advantages:**
- Automatically created and managed by Docker
- Portable across machines
- Easier to backup and share

**Managing Named Volumes:**

```bash
# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect app_data

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm app_data

# Backup volume
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/app_data.tar.gz -C /data .

# Restore volume
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/app_data.tar.gz -C /data
```

#### 2. Bind Mounts (For Development)

```yaml
services:
  app:
    volumes:
      - ./data:/app/data  # Host path : Container path
      - ./src:/app/src    # For hot reload during development
```

**Advantages:**
- Direct access to files on host machine
- Easy to edit files in IDE while container runs
- Good for development

**Path Examples:**

```yaml
# Absolute paths
volumes:
  - /home/user/data:/app/data

# Relative paths (relative to docker-compose.yml location)
volumes:
  - ./data:/app/data

# Windows absolute path
volumes:
  - C:\Users\YourName\data:/app/data

# Windows WSL path
volumes:
  - /mnt/c/Users/YourName/data:/app/data
```

#### 3. tmpfs (Temporary, In-Memory)

```yaml
services:
  app:
    tmpfs:
      - /tmp
      - /cache:size=256m
```

**Advantages:**
- Very fast (in-memory)
- Automatically cleaned up
- Good for temporary files

### Accessing Volume Data

#### From Host Machine

```bash
# If using named volume with bind mount
cd /home/app/data
ls -la

# If using pure named volume (location varies)
docker volume inspect app_data | grep Mountpoint
# Then navigate to that path as root/privileged user

# Or copy files directly
docker cp container_id:/app/data/database.sqlite ./backup.sqlite
docker cp ./backup.sqlite container_id:/app/data/database.sqlite
```

#### From Inside Container

```bash
# Exec into container
docker exec -it <container-name> sh

# View files in volume
ls -la /app/data/

# Edit files
vi /app/data/config.json
```

#### From Another Container

```bash
# Mount same volume in another container
docker run --rm -v app_data:/data alpine ls /data

# Backup using another container
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine cp /data/database.sqlite /backup/
```

### Volume Backup & Restore Strategies

#### Strategy 1: Tar Archive Backup

```bash
# Backup
docker run --rm -v app_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/app_data_$(date +%Y%m%d).tar.gz -C /data .

# Restore
docker volume create app_data_new
docker run --rm -v app_data_new:/data -v $(pwd):/backup \
  alpine tar xzf /backup/app_data_20240115.tar.gz -C /data
```

#### Strategy 2: Direct File Copy

```bash
# Backup database
docker cp app_container:/app/data/database.sqlite ./backup.sqlite

# Restore database
docker cp ./backup.sqlite app_container:/app/data/database.sqlite
```

#### Strategy 3: Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VOLUME_NAME="app_data"

mkdir -p $BACKUP_DIR

# Create backup
docker run --rm -v $VOLUME_NAME:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/app_data_$TIMESTAMP.tar.gz -C /data .

# Keep only last 30 days of backups
find $BACKUP_DIR -name "app_data_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/app_data_$TIMESTAMP.tar.gz"
```

#### Strategy 4: Docker Storage Driver

```bash
# For volumes using local driver, files are stored at:
# Linux: /var/lib/docker/volumes/<volume-name>/_data/
# Docker Desktop: Docker VM's filesystem

# List all volumes and their locations
docker volume ls
docker volume inspect app_data
```

### Multi-Container Volume Sharing

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    volumes:
      - app_data:/app/data
      - shared_logs:/app/logs

  backup_service:
    image: alpine
    volumes:
      - app_data:/backup/data  # Same volume
      - shared_logs:/backup/logs
    command: sh -c "cp /backup/data/database.sqlite /backup/logs/db_backup.sqlite"

volumes:
  app_data:
    driver: local
  shared_logs:
    driver: local
```

### Volume Permissions Issues

```bash
# If permissions are denied inside container
docker-compose exec -u root app chown -R node:node /app/data

# Or set permissions in Dockerfile
RUN mkdir -p /app/data && chmod 755 /app/data && chown -R node:node /app/data
```

### Complete docker-compose.yml with All Features

**File:** `docker-compose.yml` (Comprehensive Example)

```yaml
version: '3.8'

services:
  # Application container
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: food-pantry-app
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATA_DIRECTORY: /app/data/
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD:-root_password}
      DB_NAME: food_pantry_db
    volumes:
      # Named volume for persistent data
      - app_data:/app/data
      # Bind mount for logs (optional)
      - ./logs:/app/logs
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/"]
      interval: 10s
      timeout: 5s
      retries: 3

  # MySQL database container
  mysql:
    image: mysql:8.0
    container_name: food-pantry-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-root_password}
      MYSQL_DATABASE: food_pantry_db
      MYSQL_ALLOW_EMPTY_PASSWORD: "false"
    volumes:
      # Named volume for database persistence
      - mysql_data:/var/lib/mysql
      # SQL init script (optional)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Optional: PhpMyAdmin for database management
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: food-pantry-phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: ${DB_PASSWORD:-root_password}
      PMA_DB: food_pantry_db
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - app-network
    restart: unless-stopped

# Named volumes for data persistence
volumes:
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${DATA_MOUNT_PATH:-./data}
  mysql_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${MYSQL_DATA_PATH:-./mysql_data}

# Custom bridge network for container communication
networks:
  app-network:
    driver: bridge
```

---

## Quick Reference: Changing Databases

### Switch from SQLite to MySQL

1. Update `server/db.ts` with MySQL dialect
2. Install `mysql2` package
3. Update environment variables in `.env`
4. Create MySQL database and tables
5. Update `docker-compose.yml` to include MySQL service
6. Run `docker-compose up -d`

### Switch from MySQL back to SQLite

1. Revert `server/db.ts` to original SQLite configuration
2. Remove `mysql2` package: `npm uninstall mysql2`
3. Remove MySQL service from `docker-compose.yml`
4. Ensure `/data/database.sqlite` exists
5. Run application normally

### Quick Start Commands

```bash
# Development with SQLite
npm start

# Development with Docker
docker-compose up -d

# Production build
npm run build

# View logs
docker-compose logs -f app

# Backup database
docker-compose exec mysql mysqldump -u root -p<password> food_pantry_db > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p<password> food_pantry_db < backup.sql
```

---

## Environment Variables Reference

```
# Server Configuration
NODE_ENV=production|development
PORT=4000|3001

# Data Storage
DATA_DIRECTORY=/home/app/data/

# SQLite (Default)
# No additional env vars needed
# Database: ./data/database.sqlite

# MySQL Configuration
DB_HOST=localhost|mysql|hostname
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=food_pantry_db
```

---

This guide provides all the information needed to understand and modify the database and backend connections for this application.
