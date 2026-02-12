import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"; // your existing config.ts

const config = readConfig(); // reads db_url from .gatorconfig.json

export default defineConfig({
  schema: "src/lib/db/schema.ts",           // path to your schema
  out: "src/lib/db/migrations",          // where migrations will be generated
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,               // use the db_url from your config
  },
});

