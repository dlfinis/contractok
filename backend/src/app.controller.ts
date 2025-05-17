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
    let userCount = null;
    let worldcoinStatus = 'unknown';
    try {
      // Revisión base de datos
      try {
        userCount = await this.prisma.user.count();
      } catch (e) {
        userCount = null;
      }
      // Revisión servicio externo (Worldcoin)
      try {
        const res = await fetch('https://api.worldcoin.org/health');
        if (res.ok) {
          worldcoinStatus = 'ok';
        } else {
          worldcoinStatus = 'error';
        }
      } catch (e) {
        worldcoinStatus = 'error';
      }
      return { status: 'ok', userCount, worldcoinStatus };
    } catch (e) {
      return { status: 'error', error: e.message, userCount, worldcoinStatus };
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
