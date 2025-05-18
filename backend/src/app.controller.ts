import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('api')
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

  @Post('/auth')
  async authUser(@Body() body: { hash_id: string; name?: string }) {
    let user = await this.prisma.user.findUnique({ where: { hash_id: body.hash_id } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { hash_id: body.hash_id, name: body.name || null },
      });
    }
    return user;
  }

  @Post('/user')
  async createUser(@Body() body: { hash_id: string; name?: string }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          hash_id: body.hash_id,
          name: body.name || null,
        },
      });
      return user;
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
    creadorHashId: string;
    contraparteHashId?: string;
  }) {
    if (!body.tipo || !body.monto || !body.plazoEntrega || !body.creadorHashId) {
      return { error: 'Faltan campos obligatorios' };
    }
    const fee = Number((body.monto * 0.01).toFixed(2));
    const plazo = new Date(body.plazoEntrega);
    const deadlineAprobacion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h desde ahora
    const codigoVinculacion = await this.generarCodigoVinculacion();

    // Asegura que el usuario creador existe
    let user = await this.prisma.user.findUnique({ where: { hash_id: body.creadorHashId } });
    if (!user) {
      user = await this.prisma.user.create({ data: { hash_id: body.creadorHashId } });
    }

    const contract = await this.prisma.contract.create({
      data: {
        tipo: body.tipo,
        monto: body.monto,
        fee,
        plazoEntrega: plazo,
        descripcion: body.descripcion,
        estado: 'pendiente',
        creadorHashId: body.creadorHashId,
        contraparteHashId: body.contraparteHashId,
        deadlineAprobacion,
        codigoVinculacion,
        aprobadoCreador: true, // El creador lo aprueba al crear
        aprobadoContraparte: false,
      },
    });
    return contract;
  }

  // Obtener contrato por código de vinculación
  @Get('/contracts/code/:codigo')
  async getContractByCode(@Param('codigo') codigo: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { codigoVinculacion: codigo.toUpperCase() },
      include: { creador: true, contraparte: true },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    return contract;
  }

  // Obtener contrato por ID
  @Get('/contracts/:id')
  async getContract(@Param('id') id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: Number(id) },
      include: { creador: true, contraparte: true },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    return contract;
  }

  // Aprobar/rechazar contrato (contraparte)
  @Post('/contracts/:id/approve')
  async approveContract(@Param('id') id: string, @Body() body: { aprobar: boolean }) {
    const contract = await this.prisma.contract.findUnique({ where: { id: Number(id) } });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    // if (contract.estado !== 'pendiente') {
    //   return { error: 'El contrato ya fue procesado' };
    // }
    let estado = contract.estado;
    let aprobadoContraparte = contract.aprobadoContraparte;
    if (body.aprobar) {
      estado = 'aprobado';
      aprobadoContraparte = true;
    } else {
      estado = 'rechazado';
      aprobadoContraparte = false;
    }
    const updated = await this.prisma.contract.update({
      where: { id: Number(id) },
      data: {
        estado,
        aprobadoContraparte,
      },
    });
    return updated;
  }
}
