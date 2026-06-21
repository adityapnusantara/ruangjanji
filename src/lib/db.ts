import fs from "node:fs";
import path from "node:path";
import pg from "pg";

type DbPool = InstanceType<typeof pg.Pool>;
type DbQueryResult<T> = {
  rows: T[];
  rowCount: number | null;
};

declare global {
  var weddingInvitationPool: DbPool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const connectionUrl = new URL(databaseUrl);
  connectionUrl.searchParams.delete("sslmode");
  return connectionUrl;
}

function getSslConfig(connectionUrl: URL) {
  const caPath = process.env.AIVEN_CA_CERT_PATH;
  if (!caPath) {
    return undefined;
  }

  const resolvedPath = path.isAbsolute(caPath)
    ? caPath
    : path.join(/* turbopackIgnore: true */ process.cwd(), caPath);
  const ca = fs.readFileSync(resolvedPath, "utf8");

  return {
    ca,
    rejectUnauthorized: true,
    servername: connectionUrl.hostname,
  };
}

export function getDbPool() {
  if (!globalThis.weddingInvitationPool) {
    const connectionUrl = getDatabaseUrl();
    globalThis.weddingInvitationPool = new pg.Pool({
      connectionString: connectionUrl.toString(),
      ssl: getSslConfig(connectionUrl),
    });
  }

  return globalThis.weddingInvitationPool;
}

export async function query<T>(text: string, values: unknown[] = []): Promise<DbQueryResult<T>> {
  return getDbPool().query(text, values) as Promise<DbQueryResult<T>>;
}
