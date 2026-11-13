/**
 * Frecuencias del planificador de recordatorios. Solo DIARIA, SEMANAL y
 * MENSUAL generan la siguiente ocurrencia; NINGUNA procesa el aviso una vez.
 * La lista coincide con las reglas de calendario implementadas por el cron.
 */
export enum RepeticionEnum {
  /** Aviso de ocurrencia única, sin reprogramación automática. */
  NINGUNA = 'ninguna',
  /** Reprograma un día después conservando la hora UTC. */
  DIARIA = 'diaria',
  /** Reprograma siete días después conservando la hora UTC. */
  SEMANAL = 'semanal',
  /** Mantiene el día ancla y ajusta al último día de meses más cortos. */
  MENSUAL = 'mensual',
}
