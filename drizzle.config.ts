import { type Config, defineConfig } from 'drizzle-kit';

import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/utils/drizzle/schemas.ts',
  out: './src/utils/drizzle/migrations',
  dbCredentials: {
    url:
      process.env.DB_CONNECTION_STR ??
      (() => {
        throw new Error('DB_CONNECTION_STR env missing');
      })(),
  },
  verbose: true,
  strict: true,
  dialect: 'postgresql',
}) satisfies Config;
