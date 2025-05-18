import { 
  Controller, 
  Get, 
  Post,
  Patch, 
  Body, 
  Param, 
  Delete,
  NotFoundException, 
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

// Definimos un tipo personalizado para los usuarios con world_id
interface UserWithWorldId {
  id: number;
  world_id: string;
  name: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
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
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          world_id: true,
          name: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return { status: 'success', users };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new InternalServerErrorException('Error al obtener la lista de usuarios');
    }
  }

  @Get('/users/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.prisma.$queryRaw`
        SELECT id, "world_id", name, "createdAt" as "createdAt"
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
        WHERE "world_id" LIKE 'test_%'
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
      // Buscar o crear el usuario usando Prisma Client
      const user = await this.prisma.user.upsert({
        where: { world_id: body.worldId },
        update: {},
        create: {
          world_id: body.worldId,
          name: body.name || `Usuario_${body.worldId.substring(0, 8)}`,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return user;
    } catch (e) {
      console.error('Error en authUser:', e);
      throw new Error('Error authenticating user');
    }
  }

  @Post('/user')
  async createUser(@Body() body: { worldId: string; name?: string }) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { world_id: body.worldId }
      });
      
      if (existingUser) {
        return existingUser;
      }
      
      // Crear nuevo usuario usando Prisma Client
      const newUser = await this.prisma.user.create({
        data: {
          world_id: body.worldId,
          name: body.name || `Usuario_${body.worldId.substring(0, 8)}`,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return newUser;
    } catch (e) {
      console.error('Error creating user:', e);
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

    console.log('body create contract', body);
    if (!body.tipo || !body.monto || !body.plazoEntrega || !body.creadorWorldId) {
      return { error: 'Faltan campos obligatorios' };
    }
    const fee = Number((body.monto * 0.01).toFixed(2));
    const plazo = new Date(body.plazoEntrega);
    const deadlineAprobacion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h desde ahora
    const codigoVinculacion = await this.generarCodigoVinculacion();

    const newContract = await this.prisma.contract.create({
      data: {
        tipo: body.tipo,
        monto: body.monto,
        fee,
        plazoEntrega: plazo.toISOString(),
        descripcion: body.descripcion || null,
        creadorWorldId: body.creadorWorldId,
        contraparteWorldId: body.contraparteWorldId || null,
        estado: 'pendiente',
        codigoVinculacion,
        deadlineAprobacion,
        aprobadoCreador: true,
        aprobadoContraparte: false
      }
    });

    return newContract;
  }

  // Obtener contrato por código de vinculación
  @Get('/contracts/code/:codigo')
  async getContractByCode(@Param('codigo') codigo: string) {
    try {
      const contracts = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."world_id" as "creadorWorldId", u1.name as "creador_name",
               u2."world_id" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."world_id"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."world_id"
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
               u1."world_id" as "creadorWorldId", u1.name as "creador_name",
               u2."world_id" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."world_id"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."world_id"
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
               u1."world_id" as "creadorWorldId", u1.name as "creador_name",
               u2."world_id" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."world_id"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."world_id"
        WHERE c.id = ${parseInt(id)}
        LIMIT 1
      `;
      
      return updatedContract[0];
    } catch (e) {
      return { error: e.message };
    }
  }

  @Post('/contracts/:id/start-arbitration')
  async startArbitration(@Param('id') id: string) {
    try {
      // Primero verificamos que el contrato existe
      const contract = await this.prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });

      if (!contract) {
        throw new NotFoundException('Contrato no encontrado');
      }

      // Actualizamos el estado a 'arbitraje'
      const updatedContract = await this.prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'arbitraje',
          updatedAt: new Date(),
        },
        include: {
          creador: {
            select: { worldId: true, name: true }
          },
          contraparte: {
            select: { worldId: true, name: true }
          }
        }
      });

      // Aquí podrías agregar lógica adicional como:
      // - Notificar a las partes
      // - Crear un caso de arbitraje
      // - Iniciar cualquier otro proceso necesario

      return updatedContract;
    } catch (e) {
      console.error('Error en startArbitration:', e);
      throw new InternalServerErrorException('Error al iniciar el proceso de arbitraje');
    }
  }

  @Patch('/contracts/:id/status')
  async updateContractStatus(@Param('id') id: string, @Body() body: { estado: string }) {
    try {
      const updatedContracts = await this.prisma.$queryRaw<any[]>`
        UPDATE "Contract"
        SET estado = ${body.estado}, "updatedAt" = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `;
      
      if (updatedContracts.length === 0) {
        throw new Error('No se pudo actualizar el contrato');
      }
      
      // Obtenemos la información completa del contrato con los usuarios relacionados
      const updatedContract = await this.prisma.$queryRaw<any[]>`
        SELECT c.*, 
               u1."world_id" as "creadorWorldId", u1.name as "creador_name",
               u2."world_id" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."world_id"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."world_id"
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
               u1."world_id" as "creadorWorldId", u1.name as "creador_name",
               u2."world_id" as "contraparteWorldId", u2.name as "contraparte_name"
        FROM "Contract" c
        LEFT JOIN "User" u1 ON c."creadorWorldId" = u1."world_id"
        LEFT JOIN "User" u2 ON c."contraparteWorldId" = u2."world_id"
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
