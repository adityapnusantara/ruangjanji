import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const adminUrl = process.env.AIVEN_ADMIN_DATABASE_URL;
const targetDb = process.env.AIVEN_TARGET_DATABASE || "wedding_invitation";
const caPath = process.env.AIVEN_CA_CERT_PATH || path.resolve("certs/aiven-ca.pem");
const connectionUrl = new URL(adminUrl || "postgres://missing");
connectionUrl.searchParams.delete("sslmode");

if (!adminUrl) {
  console.error("Missing AIVEN_ADMIN_DATABASE_URL");
  process.exit(1);
}

if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(targetDb)) {
  console.error("Invalid database name");
  process.exit(1);
}

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

const existsResult = await client.query(
  "select 1 from pg_database where datname = $1",
  [targetDb],
);

if (existsResult.rowCount === 0) {
  await client.query(`create database ${pg.Client.prototype.escapeIdentifier ? client.escapeIdentifier(targetDb) : '"' + targetDb.replaceAll('"', '""') + '"'}`);
  console.log(`created:${targetDb}`);
} else {
  console.log(`exists:${targetDb}`);
}

await client.end();
