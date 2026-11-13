/**
 * Máquina de estados de la cola de recordatorios. El cron reclama PENDIENTE
 * como PROCESANDO, reintenta fallos volviendo a PENDIENTE y pasa recordatorios
 * únicos vencidos a PENDIENTE_ATENCION. CANCELADO identifica avisos de cuidados
 * ya completados; los valores limitados evitan estados no procesables.
 */
export enum EstadoRecordatorioEnum {
  /** En cola y elegible para la selección del cron. */
  PENDIENTE = 'pendiente',
  /** Recordatorio único cuyo envío ya se intentó y requiere atención. */
  PENDIENTE_ATENCION = 'pendiente_atencion',
  /** Reclamado temporalmente por el cron para evitar envíos duplicados. */
  PROCESANDO = 'procesando',
  /** Ya no debe enviarse porque el cuidado asociado fue completado. */
  CANCELADO = 'cancelado',
}
