import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EspecieModule } from './especie/especie.module';
import { EventoAmbientalModule } from './evento-ambiental/evento_ambiental.module';
import { LogroModule } from './logro/logro.module';
import { ArbolModule } from './arbol/arbol.module';
import { CuidadoModule } from './cuidado/cuidado.module';
import { RecordatorioModule } from './recordatorio/recordatorio.module';
import { FotografiaModule } from './fotografia/fotografia.module';
import { HistorialModule } from './historial/historial.module';
import { UsuarioLogroModule } from './usuario-logro/usuario-logro.module';
import { PublicacionModule } from './publicacion/publicacion.module';
import { ComentarioModule } from './comentario/comentario.module';
import { ParticipacionModule } from './participacion/participacion.module';
import { GamificacionModule } from './gamificacion/gamificacion.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TareasModule } from './tareas/tareas.module';
import { SecurityModule } from './security.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    // Inicializa el scheduler global para habilitar los decoradores Cron.
    ScheduleModule.forRoot(),

    // Configuración de variables de entorno
    // isGlobal: true hace que ConfigService esté disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Define el límite predeterminado que usarán las rutas protegidas por ThrottlerGuard.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),

    // Configuración de TypeORM con MySQL
    // useFactory permite inyectar ConfigService para leer variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        // Selecciona MySQL como motor de persistencia.
        type: 'mysql',
        // Exige el host para fallar al iniciar si falta una configuración esencial.
        host: configService.getOrThrow<string>('DB_HOST'),
        // Convierte el puerto configurado a número para evitar una opción mal tipada.
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        // Exige el usuario de base de datos en la configuración del entorno.
        username: configService.getOrThrow<string>('DB_USERNAME'),
        // Lee la contraseña del entorno; no la incluye en el repositorio.
        password: configService.get<string>('DB_PASSWORD', ''),
        // Exige el nombre de la base de datos para evitar conexión a una base accidental.
        database: configService.getOrThrow<string>('DB_DATABASE'),
        // Interpreta y serializa las columnas datetime como UTC, independientemente de la zona local.
        timezone: 'Z',
        // Registra las entidades de los módulos Nest sin enumerarlas manualmente.
        autoLoadEntities: true,
        // Solo habilita sincronización automática en desarrollo; en producción queda desactivada.
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        // Busca migraciones TypeScript en desarrollo y JavaScript compilado en dist.
        migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
        // Las migraciones se ejecutan explícitamente durante despliegue, no al arrancar la API.
        migrationsRun: false,
      }),
    }),

    // Módulos de la aplicación
    UserModule,
    AuthModule,
    EspecieModule,
    EventoAmbientalModule,
    LogroModule,
    ArbolModule,
    CuidadoModule,
    RecordatorioModule,
    FotografiaModule,
    HistorialModule,
    UsuarioLogroModule,
    PublicacionModule,
    ComentarioModule,
    ParticipacionModule,
    GamificacionModule,
    TareasModule,
    SecurityModule,
    CloudinaryModule,
    NotificacionesModule,
  ],
})
export class AppModule {}
