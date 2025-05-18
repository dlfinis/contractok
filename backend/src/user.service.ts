import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(worldId: string, data: { name?: string; isVerified?: boolean } = {}) {
    // Buscar usuario por worldId
    let user = await this.prisma.user.findUnique({
      where: { world_id: worldId },
    });

    // Si no existe, crearlo
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          world_id: worldId,
          name: data.name || `Usuario_${worldId.substring(0, 8)}`,
          isVerified: data.isVerified !== undefined ? data.isVerified : true,
        },
      });
    } else {
      // Si existe, actualizar los campos necesarios
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.name || user.name,
          isVerified: data.isVerified !== undefined ? data.isVerified : user.isVerified,
        },
      });
    }

    return user;
  }

  async getUserByWorldId(worldId: string) {
    return this.prisma.user.findUnique({
      where: { world_id: worldId },
    });
  }
}
