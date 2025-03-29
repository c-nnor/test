import { Controller, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { TravelpathController } from './travelpath/travelpath.controller';
import { TravelpathModule } from './travelpath/travelpath.module';
import { TravelpathService } from './travelpath/travelpath.service';
import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { LeaderboardService } from './leaderboard/leaderboard.service';

@Module({
  imports: [ConfigModule.forRoot(), NotesModule, TravelpathModule, PrismaModule, AuthModule, MailModule, TravelpathModule, LeaderboardModule], 
  controllers: [AppController, TravelpathController, LeaderboardController],
  providers: [AppService, PrismaService, AuthService, MailService, TravelpathService, LeaderboardService]
})
export class AppModule {}
