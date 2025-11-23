import { Module } from '@nestjs/common';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { ConfigurationModule } from './modules/config/config.module';

@Module({
  imports: [ConfigurationModule, DataSourceModule],
})
export class AppModule {}
