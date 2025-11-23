import { Module } from '@nestjs/common';
import { WormholePipesService } from './services/wormholePipes.service';

@Module({
  imports: [],
  providers: [WormholePipesService],
})
export class DataSourceModule {}
