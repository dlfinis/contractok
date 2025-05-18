import { Controller, Post, Body, Get } from '@nestjs/common';
import { WorldIDService } from './worldid.service';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';

@Controller('api')
export class VerifyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  /**
   * Endpoint para verificar y vincular un usuario World ID usando nullifier_hash
   */
  @Post('verify')
  async verifyProof(@Body() body: any) {
    const { payload, action, signal } = body;
    console.log('--- [WorldID] Solicitud de verificación recibida ---');
    console.log('Payload recibido:', JSON.stringify(payload, null, 2));
    console.log('Action:', action);
    console.log('Signal:', signal);
    let link;
    if (!payload || !payload.nullifier_hash) {
      return { status: 400, message: 'Falta nullifier_hash en el payload' };
    }
    if (payload) {
      console.log('nullifier_hash:', payload.nullifier_hash);
      // --- Vinculación en base de datos ---
      link = await this.prisma.worldIDLink.findUnique({
        where: { nullifier_hash: payload.nullifier_hash }
      });
      if (!link) {
        link = await this.prisma.worldIDLink.create({
          data: {
            nullifier_hash: payload.nullifier_hash,
            action,
            signal,
            verification_level: payload.verification_level,
          }
        });
        console.log(`[WorldID] nullifier_hash vinculado en DB:`, link);
      } else {
        console.log(`[WorldID] nullifier_hash ya vinculado en DB:`, link);
      }
      // --- Fin vinculación en base de datos ---
      console.log('merkle_root:', payload.merkle_root);
      console.log('proof:', payload.proof);
      console.log('verification_level:', payload.verification_level);
      console.log('credential_type:', payload.credential_type);
      console.log('signal_hash:', payload.signal_hash);
    }

    if (!payload || !payload.proof) {
      console.log('[WorldID] Proof inválido o faltante');
      return { status: 400, message: 'Proof inválido o faltante' };
    }

    try {
      console.log('[WorldID] Iniciando verificación de proof con Worldcoin Cloud API...');
      const app_id = process.env.VITE_WLD_CLIENT_ID || 'default-app-id';
      const result = await WorldIDService.verifyProofWithWorldcoinAPI({
        nullifier_hash: payload.nullifier_hash,
        merkle_root: payload.merkle_root,
        proof: payload.proof,
        verification_level: payload.verification_level,
        action,
        signal_hash: payload.signal_hash,
        app_id,
      });
      console.log('[WorldID] Resultado de verificación Cloud:', result);
      if (result.success) {
        // Vincular usuario si la verificación fue exitosa
        if (!link) {
          link = await this.prisma.worldIDLink.create({
            data: {
              nullifier_hash: payload.nullifier_hash,
              action,
              verification_level: payload.verification_level,
            },
          });
        }

        // Crear o actualizar el usuario
        const user = await this.userService.findOrCreateUser(payload.nullifier_hash, {
          isVerified: true
        });

        return { 
          status: 200, 
          message: 'Verificación exitosa', 
          link,
          user: {
            id: user.id,
            worldId: user.worldId,
            name: user.name,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        };
      } else if (result.code === 'max_verifications_reached') {
        // Si ya está en base de datos, considera autenticado
        const existingLink = await this.prisma.worldIDLink.findUnique({
          where: { nullifier_hash: payload.nullifier_hash }
        });
        if (existingLink) {
          return { status: 200, message: 'Usuario ya autenticado previamente.', link: existingLink };
        } else {
          return { status: 400, message: 'Usuario no autenticado y no puede volver a verificar.', result };
        }
      } else {
        console.log('[WorldID] Proof inválido (Cloud):', result);
        return { status: 400, message: 'Proof inválido', result };
      }
    } catch (err) {
      console.log('[WorldID] Error al verificar proof (Cloud):', err);
      return { status: 500, message: 'Error al verificar proof (Cloud)', error: err?.message || err };
    }
  }

  /**
   * Endpoint para consultar si un nullifier_hash ya está vinculado
   */
  @Post('is-linked')
  async isLinked(@Body() body: { nullifier_hash: string }) {
    const { nullifier_hash } = body;
    const link = await this.prisma.worldIDLink.findUnique({ where: { nullifier_hash } });
    return {
      nullifier_hash,
      linked: !!link,
      linkedData: link || null,
    };
  }

  /**
   * Endpoint para consultar todos los registros de WorldIDLink
   */
  @Get('worldid-links')
  async getAllLinks() {
    return await this.prisma.worldIDLink.findMany({ orderBy: { linkedAt: 'desc' } });
  }
}
