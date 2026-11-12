import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { QueryFailedError, Repository } from 'typeorm';

import { Arbol } from '../arbol/entities/arbol.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);
  private messaging!: Messaging;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,
  ) {}

  onModuleInit(): void {
    // Exige la configuración del proyecto y la ruta externa de credenciales para inicializar Firebase.
    const credentialsPath = this.configService.getOrThrow<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    const projectId = this.configService.getOrThrow<string>(
      'FIREBASE_PROJECT_ID',
    );

    // Carga la cuenta de servicio desde la ruta externa sin copiar sus secretos al repositorio.
    const firebaseApp =
      getApps().find((app) => app.name === 'arbol-go-push') ??
      initializeApp(
        {
          credential: cert(credentialsPath),
          projectId,
        },
        'arbol-go-push',
      );

    // Obtiene el cliente FCM de la aplicación inicializada.
    this.messaging = getMessaging(firebaseApp);
  }

  async registrarToken(userId: number, fcmToken: string): Promise<void> {
    // Comprueba si el token ya pertenece a otra cuenta antes de asociarlo.
    const propietario = await this.userRepository
      .createQueryBuilder('usuario')
      .select('usuario.id', 'id')
      .addSelect('usuario.fcmToken', 'fcmToken')
      .where('usuario.fcmToken = :fcmToken', { fcmToken })
      .getRawOne<{ id: number; fcmToken: string }>();

    if (propietario && Number(propietario.id) !== userId) {
      throw new ConflictException(
        'El token de dispositivo ya está asociado a otro usuario',
      );
    }

    // La restricción única de base de datos protege también contra registros simultáneos.
    try {
      await this.userRepository.update({ id: userId }, { fcmToken });
    } catch (error) {
      // Convierte una colisión de índice en un conflicto explícito y conserva otros errores DB.
      if (
        error instanceof QueryFailedError &&
        typeof error.driverError === 'object' &&
        error.driverError !== null &&
        'code' in error.driverError &&
        error.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'El token de dispositivo ya está asociado a otro usuario',
        );
      }
      throw error;
    }
  }

  async retirarToken(userId: number): Promise<void> {
    // El criterio limita el cambio al usuario autenticado recibido desde el controlador.
    await this.userRepository.update({ id: userId }, { fcmToken: null });
  }

  async enviarPushDeRecordatorio(
    idArbol: number,
    idRecordatorio: number,
    titulo: string,
    cuerpo: string,
  ): Promise<void> {
    // Consulta solo la identidad del propietario y el token privado requerido para el push.
    const propietario = await this.arbolRepository
      .createQueryBuilder('arbol')
      .innerJoin('arbol.usuario', 'usuario')
      .select('usuario.id', 'usuarioId')
      .addSelect('usuario.fcmToken', 'fcmToken')
      .where('arbol.id_arbol = :idArbol', { idArbol })
      .getRawOne<{ usuarioId: number; fcmToken: string | null }>();

    if (!propietario) {
      throw new Error(`No se encontró el propietario del árbol ${idArbol}`);
    }

    // Un usuario sin dispositivo registrado no impide que el cron procese el recordatorio.
    if (!propietario.fcmToken) {
      this.logger.warn(
        `El usuario ${propietario.usuarioId} no tiene un token FCM registrado`,
      );
      return;
    }

    try {
      // Envía el push al token vigente e incluye IDs no sensibles para navegación en la app.
      await this.messaging.send({
        token: propietario.fcmToken,
        notification: { title: titulo, body: cuerpo },
        data: {
          arbolId: String(idArbol),
          recordatorioId: String(idRecordatorio),
        },
      });
    } catch (error) {
      // Firebase confirma estos códigos cuando ya no se debe conservar el token.
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : '';

      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        await this.userRepository.update(
          { id: propietario.usuarioId, fcmToken: propietario.fcmToken },
          { fcmToken: null },
        );
        this.logger.warn(
          `Se retiró un token FCM inválido del usuario ${propietario.usuarioId}`,
        );
        return;
      }

      // Los errores transitorios se propagan para que el cron restaure el estado y reintente.
      throw error;
    }
  }
}
