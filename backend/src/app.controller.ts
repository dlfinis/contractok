import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Backend funcionando correctamente 🚀';
  }

  @Get('/health')
  async health() {
    try {
      let userCount = null;
      try {
        userCount = await this.prisma.user.count();
      } catch (e) {
        userCount = null;
      }
      return { status: 'ok', userCount };
    } catch (e) {
      return { status: 'error', error: e.message };
    }
  }

  @Post('/user')
  async createUser(@Body() body: { email: string; name?: string }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          name: body.name || null,
        },
      });
      return user;
    } catch (e) {
      return { error: e.message };
    }
  }
}
