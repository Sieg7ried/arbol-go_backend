// Representa la identidad mínima disponible después de validar el JWT.
export interface AuthenticatedUser {
  // Identificador del usuario propietario usado por OwnershipGuard.
  id_usuario: number;

  // Rol con el nombre solicitado por la capa de autorización.
  rol: string;

  // Alias compatible con el RolesGuard y código existente.
  role: string;
}
