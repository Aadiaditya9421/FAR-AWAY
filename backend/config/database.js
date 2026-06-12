import mongoose from "mongoose";
import { env } from "./env.js";
import { ensureIndexes } from "./indexes.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  const options = {
    maxPoolSize: env.mongoMaxPoolSize,
    minPoolSize: env.mongoMinPoolSize,
    connectTimeoutMS: env.mongoConnectTimeoutMS,
    socketTimeoutMS: env.mongoSocketTimeoutMS,
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMS,
  };

  let retries = 5;
  let delay = 1000;

  while (retries > 0) {
    try {
      const connection = await mongoose.connect(env.mongoUri, options);
      console.log(`MongoDB connected: ${connection.connection.host}`);
      
      // Build index definitions
      await ensureIndexes();

      return connection;
    } catch (err) {
      retries--;
      console.error(`MongoDB connection failed. Retries remaining: ${retries}. Error: ${err.message}`);
      if (retries === 0) {
        throw err;
      }
      console.log(`Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
