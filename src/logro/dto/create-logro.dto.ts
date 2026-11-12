import { IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

/**
 * Define los campos permitidos al crear un logro del catálogo.
 * El acceso administrativo se exige en el controlador; estos validadores restringen los datos.
 */
export class CreateLogroDto {
  /** Código estable de máquina usado por las reglas del backend. */
  // Rechaza tipos no textuales para mantener una clave lógica bien formada.
  @IsString({ message: 'El código debe ser una cadena de texto' })
  // Exige que el administrador asigne un código a cada logro nuevo.
  @IsNotEmpty({ message: 'El código es obligatorio' })
  // Limita el formato a mayúsculas, números y guiones bajos para evitar variantes ambiguas.
  @Matches(/^[A-Z][A-Z0-9_]{0,49}$/, {
    message: 'El código debe usar mayúsculas, números o guion bajo',
  })
  codigo: string;

  /** Nombre que identifica el logro en el catálogo. */
  // Rechaza valores que no sean texto para evitar nombres con tipos inesperados.
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  // Exige un nombre no vacío.
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  /** Descripción mostrada para explicar cómo se obtiene el logro. */
  // Rechaza valores que no sean texto.
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  // Exige una descripción no vacía.
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  descripcion: string;

  /** Cantidad de puntos que otorga el logro. */
  // Exige un entero para prevenir valores decimales o tipos incompatibles.
  @IsInt({ message: 'Los puntos otorgados deben ser un número entero' })
  // Impide definir una recompensa de puntos negativa.
  @Min(0, { message: 'Los puntos otorgados no pueden ser negativos' })
  puntos_otorgados: number;

  /** Referencia textual de la imagen del logro. */
  // Rechaza valores que no sean texto.
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  // Exige que la referencia de imagen no esté vacía.
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  imagen: string;
}
