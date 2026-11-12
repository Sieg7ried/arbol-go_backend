// Define los roles canónicos compartidos por autorización y validación de DTOs.
export enum Role {
  // Usuario estándar, limitado a sus propios recursos.
  USER = 'user',

  // Administrador con permisos de moderación y acceso administrativo.
  ADMIN = 'admin',

  // Coordinador para rutas que requieren explícitamente ese nivel funcional.
  COORDINATOR = 'coordinator',
}
