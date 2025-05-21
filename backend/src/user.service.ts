import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(world_id: string, data: { name?: string; isVerified?: boolean } = {}) {
    // Buscar usuario por world_id
    let user = await this.prisma.user.findUnique({
      where: { world_id: world_id },
    });

    // Si no existe, crearlo
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          world_id: world_id,
          name: data.name || `Usuario_${world_id.substring(0, 8)}`,
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

  async getUserByWorldId(world_id: string) {
    return this.prisma.user.findUnique({
      where: { world_id: world_id },
    });
  }
}
