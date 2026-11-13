/**
 * Estado de salud operativo del árbol. El cron pone el árbol en
 * REQUIERE_ATENCION si hay cuidados vencidos; el servicio lo restaura a
 * SALUDABLE cuando no quedan cuidados vencidos o pendientes ya expirados.
 */
export enum EstadoSaludEnum {
  /** No hay cuidados atrasados que requieran intervención. */
  SALUDABLE = 'saludable',
  /** Hay al menos un cuidado pendiente fuera de plazo o marcado vencido. */
  REQUIERE_ATENCION = 'requiere_atencion',
}
