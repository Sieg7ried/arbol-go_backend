export type RepeticionProgramada = 'diaria' | 'semanal' | 'mensual';

const MS_DIA = 24 * 60 * 60 * 1000;

// Limita las repeticiones automáticas a las frecuencias cuyo calendario está implementado.
export function esRepeticionProgramada(
  repeticion: string,
): repeticion is RepeticionProgramada {
  return (
    repeticion === 'diaria' ||
    repeticion === 'semanal' ||
    repeticion === 'mensual'
  );
}

// Calcula la siguiente fecha futura, saltando ocurrencias perdidas durante una caída del cron.
export function calcularSiguienteOcurrencia(
  fechaProgramada: Date,
  repeticion: RepeticionProgramada,
  diaAncla: number,
  ahora: Date,
): Date {
  if (repeticion === 'diaria' || repeticion === 'semanal') {
    const intervalo = repeticion === 'diaria' ? MS_DIA : 7 * MS_DIA;
    const periodosVencidos = Math.floor(
      (ahora.getTime() - fechaProgramada.getTime()) / intervalo,
    );
    return new Date(
      fechaProgramada.getTime() + (periodosVencidos + 1) * intervalo,
    );
  }

  // Mantiene el ancla mensual; si el día falta en un mes, utiliza el último disponible.
  let mesesDesdeLaFecha = 1;
  let siguiente = crearFechaMensual(
    fechaProgramada,
    mesesDesdeLaFecha,
    diaAncla,
  );

  // Omite las ocurrencias pasadas y agenda la primera futura.
  while (siguiente.getTime() <= ahora.getTime()) {
    mesesDesdeLaFecha += 1;
    siguiente = crearFechaMensual(fechaProgramada, mesesDesdeLaFecha, diaAncla);
  }

  return siguiente;
}

function crearFechaMensual(
  fechaBase: Date,
  mesesDesdeLaFecha: number,
  diaAncla: number,
): Date {
  const primerDiaDelMes = new Date(
    Date.UTC(
      fechaBase.getUTCFullYear(),
      fechaBase.getUTCMonth() + mesesDesdeLaFecha,
      1,
    ),
  );
  const ultimoDiaDelMes = new Date(
    Date.UTC(
      primerDiaDelMes.getUTCFullYear(),
      primerDiaDelMes.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      primerDiaDelMes.getUTCFullYear(),
      primerDiaDelMes.getUTCMonth(),
      Math.min(diaAncla, ultimoDiaDelMes),
      fechaBase.getUTCHours(),
      fechaBase.getUTCMinutes(),
      fechaBase.getUTCSeconds(),
      fechaBase.getUTCMilliseconds(),
    ),
  );
}
