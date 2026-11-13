/**
 * Catálogo de actividades de cuidado que puede programar el usuario. Las
 * categorías son claves persistidas y usadas en títulos de recordatorios; se
 * guardan en minúsculas para que API, filtros y datos almacenados coincidan.
 */
export enum TipoCuidadoEnum {
  /** Aporte de agua al árbol. */
  RIEGO = 'riego',
  /** Corte o mantenimiento de ramas. */
  PODA = 'poda',
  /** Aporte de abono o nutrientes. */
  ABONO = 'abono',
}
