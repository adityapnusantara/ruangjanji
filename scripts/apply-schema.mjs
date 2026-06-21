import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
const caPath = process.env.AIVEN_CA_CERT_PATH || path.resolve("certs/aiven-ca.pem");
const schemaPath = process.env.SCHEMA_PATH || path.resolve("scripts/schema.sql");

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.delete("sslmode");
const ca = fs.readFileSync(caPath, "utf8");
const schemaSql = fs.readFileSync(schemaPath, "utf8");

const client = new pg.Client({
  connectionString: connectionUrl.toString(),
  ssl: {
    ca,
    rejectUnauthorized: true,
    servername: connectionUrl.hostname,
  },
});

await client.connect();
await client.query(schemaSql);
const result = await client.query(`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
  order by table_name
`);
console.log(`schema_applied:${result.rows.map((row) => row.table_name).join(",")}`);
await client.end();
