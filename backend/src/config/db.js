import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalThis.mongooseConnectPromise) {
    globalThis.mongooseConnectPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000
      })
      .catch((err) => {
        globalThis.mongooseConnectPromise = null;
        throw err;
      });
  }

  return globalThis.mongooseConnectPromise;
};
