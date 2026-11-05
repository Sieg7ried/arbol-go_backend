// Define los roles válidos para evitar comparaciones de texto inconsistentes.
export enum Role {
  // Usuario que solo puede operar sobre sus propios recursos.
  USER = 'user',

  // Administrador con permisos de moderación.
  ADMIN = 'admin',

  // Rol existente conservado para no romper rutas previas.
  COORDINATOR = 'coordinator',
}
