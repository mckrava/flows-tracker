import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { AppConfig } from '../config';
import * as schema from '../../utils/drizzle/schemas';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor(private appConfig: AppConfig) {}

  onModuleInit() {
    this.pool = new Pool({
      max: 1,
      connectionString: this.appConfig.DB_CONNECTION_STR,
    });

    this.db = drizzle(this.pool, { schema });
    console.log('Drizzle database connection initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('Drizzle database connection closed');
  }
}
