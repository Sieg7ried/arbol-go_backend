import { join } from 'node:path';
import { DataSource } from 'typeorm';

// Exige valores esenciales y evita iniciar el CLI con conexiones incompletas.
function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value.trim();
}

// Rechaza puertos inválidos antes de intentar abrir una conexión MySQL.
const databasePort = Number(requiredEnv('DB_PORT'));
if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT debe ser un puerto TCP válido');
}

// Comparte la configuración de persistencia con la aplicación Nest.
export default new DataSource({
  type: 'mysql',
  host: requiredEnv('DB_HOST'),
  port: databasePort,
  username: requiredEnv('DB_USERNAME'),
  password: process.env.DB_PASSWORD ?? '',
  database: requiredEnv('DB_DATABASE'),
  timezone: 'Z',
  entities: [join(__dirname, '**', '*.entity.js')],
  migrations: [join(__dirname, 'migrations', '*.js')],
  synchronize: false,
});
