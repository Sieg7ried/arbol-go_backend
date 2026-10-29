import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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


@Module({
  imports: [
    // Configuración de variables de entorno
    // isGlobal: true hace que ConfigService esté disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con MySQL
    // useFactory permite inyectar ConfigService para leer variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'mysql',
        // getOrThrow lanza un error claro si la variable no existe en .env
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        // Carga automáticamente las entidades registradas con forFeature()
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Solo en desarrollo
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
  ],
})
export class AppModule {}