// Interfaz que define la estructura del payload del JWT
export interface JwtPayload {
  // Identificador usado por JwtStrategy para cargar al usuario.
  sub: number;

  // Email incluido en el token existente.
  email: string;

  // Rol firmado en el token y validado posteriormente contra el usuario.
  role: string;
}