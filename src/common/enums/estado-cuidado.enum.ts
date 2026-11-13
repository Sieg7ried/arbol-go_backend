/**
 * Ciclo de vida de una tarea de cuidado. El cron solo mueve tareas pendientes
 * vencidas a VENCIDO; el usuario puede completar una tarea, y gamificación
 * recompensa únicamente COMPLETADO. Restringir estos estados evita transiciones
 * ambiguas y comparaciones inconsistentes entre API, SQL y procesos automáticos.
 */
export enum EstadoCuidadoEnum {
  /** Espera su fecha programada y puede ser procesado por el cron. */
  PENDIENTE = 'pendiente',
  /** La fecha programada pasó sin que el cuidado se completara. */
  VENCIDO = 'vencido',
  /** El cuidado fue realizado; es el único estado que habilita la recompensa. */
  COMPLETADO = 'completado',
}
