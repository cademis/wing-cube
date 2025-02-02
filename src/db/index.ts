// import Database from "better-sqlite3";
// import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// const sqlite = new Database("sqlite.db");
export const db = drizzle(turso, { schema });
