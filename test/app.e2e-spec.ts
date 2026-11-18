import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { User } from '../src/user/entities/user.entity';
import { UserService } from '../src/user/user.service';

// Usa una clave fija solo para la aplicación aislada de pruebas.
const JWT_SECRET = 'test-secret-for-e2e-only';

// Cumple las reglas reales de contraseña exigidas durante autenticación.
const TEST_PASSWORD = 'ArbolGo123';

describe('Auth flows (e2e)', () => {
  let app: INestApplication<App>;
  let userServiceMock: {
    create: jest.Mock;
    findOneByEmail: jest.Mock;
    findById: jest.Mock;
  };
  let testUser: User;

  beforeEach(async () => {
    // Hashea la contraseña real para que el login ejercite bcrypt.compare.
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 4);

    // Prepara un usuario activo con progreso que se consultará desde el perfil.
    testUser = Object.assign(new User(), {
      id: 42,
      email: 'ana@example.com',
      password: passwordHash,
      fullName: 'Ana García',
      foto_perfil: '',
      nivel: 2,
      experiencia: 110,
      puntos: 20,
      role: 'user',
      isActive: true,
    });

    // Simula únicamente la persistencia para que las rutas reales no dependan de MySQL.
    userServiceMock = {
      create: jest.fn().mockResolvedValue(testUser),
      findOneByEmail: jest.fn().mockResolvedValue(testUser),
      findById: jest.fn().mockResolvedValue(testUser),
    };

    // Monta AuthController, AuthService, JWT y Passport reales en una app HTTP de prueba.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: 3600 },
        }),
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60_000, limit: 100 }],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: UserService, useValue: userServiceMock },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn(() => JWT_SECRET) },
        },
      ],
    }).compile();

    // Crea una aplicación Nest real para hacer solicitudes HTTP a los endpoints.
    app = moduleFixture.createNestApplication();

    // Reproduce el pipe global que rechaza propiedades no declaradas en los DTOs.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    // Cierra cada aplicación para liberar Passport, el throttler y el servidor HTTP.
    await app.close();
  });

  it('rechaza nivel, experiencia y puntos enviados durante el registro', async () => {
    // Arrange: combina campos válidos con progreso que RegisterDto no permite.
    const registration = {
      email: 'ana@example.com',
      password: TEST_PASSWORD,
      fullName: 'Ana García',
      nivel: 99,
      experiencia: 9999,
      puntos: 9999,
    };

    // Act: envía el cuerpo por el endpoint de registro real.
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registration);

    // Assert: ValidationPipe rechaza los campos extra antes de llamar a persistencia.
    expect(response.status).toBe(400);
    expect(userServiceMock.create).not.toHaveBeenCalled();
  });

  it('registra al usuario y devuelve un JWT', async () => {
    // Arrange: usa únicamente las propiedades admitidas por RegisterDto.
    const registration = {
      email: 'ana@example.com',
      password: TEST_PASSWORD,
      fullName: 'Ana García',
    };

    // Act: ejecuta registro por HTTP y usa AuthService/JwtService reales.
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registration)
      .expect(201);

    // Assert: verifica el JWT y los datos públicos de la cuenta registrada.
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      fullName: testUser.fullName,
    });
    expect(userServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining(registration),
    );
  });

  it('permite iniciar sesión y consultar el perfil usando el JWT emitido', async () => {
    // Arrange: el mock entrega el hash de contraseña y el perfil activo.
    userServiceMock.findOneByEmail.mockResolvedValue(testUser);
    userServiceMock.findById.mockResolvedValue(testUser);

    // Act: inicia sesión por HTTP para obtener un JWT firmado por JwtService real.
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: TEST_PASSWORD })
      .expect(200);
    const token = loginResponse.body.token as string;

    // Act: verifica el token mediante Passport/JwtStrategy y consulta el perfil.
    const profileResponse = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Assert: devuelve el progreso vigente y nunca incluye la contraseña.
    expect(profileResponse.body.user).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      fullName: testUser.fullName,
      nivel: testUser.nivel,
      experiencia: testUser.experiencia,
      puntos: testUser.puntos,
    });
    expect(profileResponse.body.user).not.toHaveProperty('password');
    expect(userServiceMock.findById).toHaveBeenCalledWith(testUser.id);
  });
});
