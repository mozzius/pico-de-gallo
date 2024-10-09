import "dotenv/config";
import { sql } from "@vercel/postgres";

await sql`
  CREATE TABLE IF NOT EXISTS auth_session (
    key VARCHAR PRIMARY KEY,
    session VARCHAR NOT NULL
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS auth_state (
    key VARCHAR PRIMARY KEY,
    state VARCHAR NOT NULL
  )
`;

console.log('Done ✨')