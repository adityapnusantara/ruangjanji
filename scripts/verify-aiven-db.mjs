import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
const caPath = process.env.AIVEN_CA_CERT_PATH || path.resolve("certs/aiven-ca.pem");

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.delete("sslmode");

const ca = fs.readFileSync(caPath, "utf8");

const client = new pg.Client({
  connectionString: connectionUrl.toString(),
  ssl: {
    ca,
    rejectUnauthorized: true,
    servername: connectionUrl.hostname,
  },
});

await client.connect();
const result = await client.query("select current_database() as database, current_user as user");
console.log(`connected:${result.rows[0].database}:user:${result.rows[0].user}`);
await client.end();
