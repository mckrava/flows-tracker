import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EthereumMainnetPipesService} from './ethereumMainnetPipes.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [EthereumMainnetPipesService],
})
export class AppModule {}
