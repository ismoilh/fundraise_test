import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import logger from '../logger';

dotenv.config();

const DB_URI = process.env.DB_URI || '';
const DB_NAME = 'your_database_name'; // Replace with your actual database name

export async function connectToDatabase(): Promise<{ db: Db }> {
  const client = new MongoClient(DB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    return { db };
  } catch (error) {
    logger.error('Error connecting to the database:', error);
    throw error;
  }
}
