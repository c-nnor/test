import { Module } from '@nestjs/common';  // 
import { AuthService } from './auth.service'; //
import { AuthController } from './auth.controller'; //
import { PrismaService } from '../prisma/prisma.service'; //
import { MailService } from '../mail/mail.service'; //
import { JwtModule } from '@nestjs/jwt'; //
import { PassportModule } from '@nestjs/passport'; //
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, PrismaService, MailService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}