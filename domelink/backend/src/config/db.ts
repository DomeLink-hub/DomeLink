import mongoose from "mongoose";
import { env } from "./env.js";

const MAX_RETRIES = 5;
const RETRY_BASE_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDatabase = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      return;
    } catch (error) {
      attempt += 1;
      if (attempt >= MAX_RETRIES) {
        throw error;
      }

      const delay = RETRY_BASE_MS * attempt;
      await wait(delay);
    }
  }
};
