import { sql } from "@vercel/postgres";
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";

export class StateStore implements NodeSavedStateStore {
  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = await sql`
      SELECT state FROM auth_state WHERE key = ${key}
    `;

    if (result.rowCount === 0) return;
    return JSON.parse(result.rows[0].state) as NodeSavedState;
  }

  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val);
    await sql`
      INSERT INTO auth_state (key, state)
      VALUES (${key}, ${state})
      ON CONFLICT (key)
      DO UPDATE SET state = ${state}
    `;
  }

  async del(key: string) {
    await sql`
      DELETE FROM auth_state WHERE key = ${key}
    `;
  }
}

export class SessionStore implements NodeSavedSessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = await sql`
      SELECT session FROM auth_session WHERE key = ${key}
    `;

    if (result.rowCount === 0) return;
    return JSON.parse(result.rows[0].session) as NodeSavedSession;
  }

  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val);
    await sql`
      INSERT INTO auth_session (key, session)
      VALUES (${key}, ${session})
      ON CONFLICT (key)
      DO UPDATE SET session = ${session}
    `;
  }

  async del(key: string) {
    await sql`
      DELETE FROM auth_session WHERE key = ${key}
    `;
  }
}