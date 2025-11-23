import { Module } from '@nestjs/common';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { ConfigurationModule } from './modules/config/config.module';
import { DrizzleModule } from './modules/drizzle/drizzle.module';

@Module({
  imports: [ConfigurationModule, DrizzleModule, DataSourceModule],
})
export class AppModule {}
