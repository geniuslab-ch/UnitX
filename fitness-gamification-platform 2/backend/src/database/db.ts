import { Pool, PoolConfig, QueryResult } from 'pg';

// HARDCODED for testing
const DB_URL = 'postgresql://postgres:uWXbyLAqSrUVHlSYoeSuxOxzmccOanCy@postgres.railway.internal:5432/railway';
console.log('🔧 NEW DB MODULE LOADED!');

const poolConfig: PoolConfig = {
  connectionString: DB_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err);
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

export async function getClient() {
  return await pool.connect();
}

export async function closePool() {
  await pool.end();
}

export default pool;
