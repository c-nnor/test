import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [PrismaModule],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
  exports: [LeaderboardService]
})
export class LeaderboardModule {}
