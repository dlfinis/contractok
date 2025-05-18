import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { VerifyController } from './verify.controller';

@Module({
  imports: [],
  controllers: [AppController, VerifyController],
  providers: [PrismaService],
})
export class AppModule {}
