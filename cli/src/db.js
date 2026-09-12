import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try loading .env from cli directory, or fallback to backend/.env if present
const cliEnvPath = path.resolve(__dirname, "../.env");
const backendEnvPath = path.resolve(__dirname, "../../backend/.env");

if (fs.existsSync(cliEnvPath)) {
    dotenv.config({ path: cliEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
} else {
    dotenv.config();
}

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5433/urlshortener";

const pool = new Pool({
    connectionString,
});

export default pool;
