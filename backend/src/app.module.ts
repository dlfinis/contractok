import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { VerifyController } from './verify.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [AppController, VerifyController],
  providers: [PrismaService, UserService],
})
export class AppModule {}
