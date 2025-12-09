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
