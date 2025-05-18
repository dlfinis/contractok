import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  NotFoundException, 
  ForbiddenException,
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

// Definimos un tipo personalizado para los usuarios con worldId
interface UserWithWorldId {
  id: number;
  worldId: string;
  name: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('api')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Backend funcionando correctamente 🚀';
  }

  @Get('/health')
  async health() {
    let userCount = 0;
    let worldcoinStatus = 'not_configured';
    
    try {
      // Contar usuarios usando una consulta SQL directa
      const countResult = await this.prisma.$queryRaw<{count: number}[]>`
        SELECT COUNT(*) as count FROM "User"
      `;
      userCount = Number(countResult[0]?.count) || 0;
      
      // Verificar estado de Worldcoin (esto es un ejemplo, ajusta según tu implementación)
      worldcoinStatus = 'operational'; // Asumimos que está operativo
      
      return { status: 'ok', userCount, worldcoinStatus };
    } catch (e) {
      return { status: 'error', error: e.message, userCount, worldcoinStatus };
    }
  }

  // Obtener todos los usuarios
  @Get('/users')
  async getUsers() {
    try {
      const users = await this.prisma.$queryRaw`
        SELECT id, "worldId", name, "createdAt" as "createdAt"
        FROM "User"
        ORDER BY "createdAt" DESC
      `;
      return { status: 'success', users };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  @Get('/users/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.prisma.$queryRaw`
        SELECT id, "worldId", name, "createdAt" as "createdAt"
        FROM "User"
        WHERE id = ${parseInt(id)}
        LIMIT 1
      `;
      return { status: 'success', user };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  // Endpoint para eliminar usuarios de prueba (solo para desarrollo)
  @Delete('/test-users')
  async deleteTestUsers() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Esta operación no está permitida en producción');
    }

    try {
      // Eliminar usuarios de prueba (aquellos con worldId que empiezan con 'test_')
      const result = await this.prisma.$executeRaw`
        DELETE FROM "User" 
        WHERE "worldId" LIKE 'test_%'
      `;
      
      return { 
        status: 'success',
        message: `Se eliminaron ${result} usuarios de prueba`,
        count: result
      };
    } catch (error) {
      console.error('Error al eliminar usuarios de prueba:', error);
      throw new InternalServerErrorException('Error al eliminar usuarios de prueba');
    }
  }

  @Post('/auth')
  async authUser(@Body() body: { worldId: string; name?: string }) {
    try {
      // Buscamos el usuario por worldId usando una consulta SQL directa
      let user = (await this.prisma.$queryRaw<UserWithWorldId[]>`
        SELECT * FROM "User" WHERE "worldId" = ${body.worldId} LIMIT 1
      `)[0] || null;
      
      if (!user) {
        // Si no existe, lo creamos usando una consulta SQL directa
        const newUser = await this.prisma.$queryRaw<UserWithWorldId[]>`
          INSERT INTO "User" (worldId, name) 
          VALUES (${body.worldId}, ${body.name || null})
          RETURNING *
        `;
        user = newUser[0];
      }
      
      return user;
    } catch (error) {
      console.error('Error in authUser:', error);
      throw new Error('Error authenticating user');
    }
  }

  @Post('/user')
  async createUser(@Body() body: { worldId: string; name?: string }) {
    try {
      // Buscamos el usuario por worldId
      const existingUser = (await this.prisma.$queryRaw<UserWithWorldId[]>`
        SELECT * FROM "User" WHERE "worldId" = ${body.worldId} LIMIT 1
      `)[0];
      
      if (existingUser) {
        return existingUser;
      }
      
      // Si no existe, lo creamos usando una consulta SQL directa
      const newUser = await this.prisma.$queryRaw<UserWithWorldId[]>`
        INSERT INTO "User" (worldId, name, createdAt) 
        VALUES (${body.worldId}, ${body.name || null}, NOW())
        RETURNING *
      `;
      
      return newUser[0]; // Retornamos el usuario creado
    } catch (e) {
      return { error: e.message };
    }
  }

  // Crear contrato
  // Función util para generar código de 4 caracteres
  private generarCodigoVinculacion = async (): Promise<string> => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo;
    let existe = true;
    while (existe) {
      codigo = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      // Verifica unicidad
      const c = await this.prisma.contract.findUnique({ where: { codigoVinculacion: codigo } });
      existe = !!c;
    }
    return codigo;
  };

  @Post('/contracts')
  async createContract(@Body() body: {
    tipo: string;
    monto: number;
    plazoEntrega: string; // ISO date string
    descripcion?: string;
    creadorWorldId: string;
    contraparteWorldId?: string;
  }) {
    if (!body.tipo || !body.monto || !body.plazoEntrega || !body.creadorWorldId) {
      return { error: 'Faltan campos obligatorios' };
    }
    const fee = Number((body.monto * 0.01).toFixed(2));
    const plazo = new Date(body.plazoEntrega);
    const deadlineAprobacion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h desde ahora
    const codigoVinculacion = await this.generarCodigoVinculacion();

    // Verificamos si el usuario creador existe
    const existingUser = (await this.prisma.$queryRaw<UserWithWorldId[]>`
      SELECT * FROM "User" WHERE "worldId" = ${body.creadorWorldId} LIMIT 1
    `)[0];
    
    if (!existingUser) {
      // Si no existe, creamos el usuario con valores por defecto
      await this.prisma.$queryRaw`
        INSERT INTO "User" (worldId, name) 
        VALUES (${body.creadorWorldId}, NULL)
      `;
    }

    // Creamos el contrato usando una consulta SQL directa
    const newContract = await this.prisma.$queryRaw<any>`
      INSERT INTO "Contract" (
        "tipo", "monto", "fee", "plazoEntrega", "descripcion", 
        "creadorWorldId", "contraparteWorldId", "estado", 
        "codigoVinculacion", "deadlineAprobacion",
        "aprobadoCreador", "aprobadoContraparte"
      ) VALUES (
        ${body.tipo},
        ${body.monto},
        ${fee},
        ${plazo.toISOString()},
        ${body.descripcion || null},
        ${body.creadorWorldId},
        ${body.contraparteWorldId || null},
        'pendiente',
        ${codigoVinculacion},
        ${deadlineAprobacion.toISOString()},
        true,  // aprobadoCreador
        false  // aprobadoContraparte
      )
      RETURNING *
    `;

    const contract = newContract[0];
    return contract;
  }

  // Obtener contrato por código de vinculación
  @Get('/contracts/code/:codigo')
  async getContractByCode(@Param('codigo') codigo: string) {
    try {
      const contracts = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."worldId" as "creadorWorldId", u1.name as "creador_name",
               u2."worldId" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."worldId"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."worldId"
        WHERE UPPER(c."codigoVinculacion") = UPPER(${codigo})
        LIMIT 1
      `;
      
      if (contracts.length === 0) {
        throw new NotFoundException('Código de contrato no válido');
      }
      
      return contracts[0];
    } catch (e) {
      throw new NotFoundException('Error al buscar el contrato');
    }
  }

  // Obtener contrato por ID
  @Get('/contracts/:id')
  async getContract(@Param('id') id: string) {
    try {
      const contracts = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."worldId" as "creadorWorldId", u1.name as "creador_name",
               u2."worldId" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."worldId"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."worldId"
        WHERE c.id = ${parseInt(id)}
        LIMIT 1
      `;
      
      if (contracts.length === 0) {
        throw new NotFoundException('Contrato no encontrado');
      }
      
      return contracts[0];
    } catch (e) {
      throw new NotFoundException('Error al buscar el contrato');
    }
  }

  // Aprobar/rechazar contrato (contraparte)
  @Post('/contracts/:id/approve')
  async approveContract(@Param('id') id: string, @Body() body: { aprobar: boolean }) {
    try {
      // Buscamos el contrato por ID
      const contracts = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "Contract" WHERE id = ${parseInt(id)} LIMIT 1
      `;
      
      if (contracts.length === 0) {
        throw new NotFoundException('Contrato no encontrado');
      }
      
      const contract = contracts[0];
      const newStatus = body.aprobar ? 'aprobado' : 'rechazado';
      
      // Actualizamos el estado del contrato
      const updatedContracts = await this.prisma.$queryRaw<any[]>`
        UPDATE "Contract" 
        SET estado = ${newStatus}, "actualizadoEn" = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `;
      
      if (updatedContracts.length === 0) {
        throw new Error('No se pudo actualizar el contrato');
      }
      
      // Obtenemos la información completa del contrato con los usuarios relacionados
      const updatedContract = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."worldId" as "creadorWorldId", u1.name as "creador_name",
               u2."worldId" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."worldId"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."worldId"
        WHERE c.id = ${parseInt(id)}
        LIMIT 1
      `;
      
      return updatedContract[0];
    } catch (e) {
      return { error: e.message };
    }
  }

  @Get('/contracts/user/:userId')
  async getContractsByUser(@Param('userId') userId: string) {
    try {
      const contracts = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."worldId" as "creadorWorldId", u1.name as "creador_name",
               u2."worldId" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."worldId"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."worldId"
        WHERE c."creadorWorldId" = ${userId}
        OR c."contraparteWorldId" = ${userId}
        ORDER BY c."createdAt" DESC 
      `;
      return { status: 'success', contracts };
    } catch (error) {
      console.error('Error al obtener contratos del usuario:', error);
      throw new InternalServerErrorException('Error al obtener los contratos del usuario');
    }
  }
}
