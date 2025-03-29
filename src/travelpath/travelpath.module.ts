import { Module } from '@nestjs/common';
import { TravelpathService } from './travelpath.service';
import { TravelpathController } from './travelpath.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TravelpathService],
  controllers: [TravelpathController]
})
export class TravelpathModule {}
