// Convierte una fecha ISO 8601 recibida por la API en un instante UTC válido.
export function parseUtcDate(value: string): Date {
  // Interpreta el valor ISO como un instante absoluto.
  const date = new Date(value);

  // Rechaza fechas inválidas para evitar desfases o datos corruptos.
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Fecha ISO 8601 inválida: ${value}`);
  }

  // Devuelve el instante normalizado que Date representa en UTC.
  return date;
}

// Obtiene la parte de fecha UTC con formato YYYY-MM-DD para MySQL.
export function toUtcDatePart(value: Date): string {
  // Usa toISOString para no depender de la zona horaria del servidor.
  return value.toISOString().slice(0, 10);
}

// Obtiene la parte de hora UTC con formato HH:mm:ss para MySQL.
export function toUtcTimePart(value: Date): string {
  // Extrae la hora desde la representación ISO UTC.
  return value.toISOString().slice(11, 19);
}

// Combina las columnas date y time de MySQL en un instante UTC comparable.
export function combineUtcDateAndTime(fecha: Date, hora: string): Date {
  // Obtiene la fecha almacenada usando componentes UTC.
  const datePart = fecha.toISOString().slice(0, 10);

  // Añade Z para indicar explícitamente que la hora pertenece a UTC.
  const combined = new Date(`${datePart}T${hora}Z`);

  // Rechaza combinaciones inválidas antes de compararlas.
  if (Number.isNaN(combined.getTime())) {
    throw new Error(`Fecha y hora UTC inválidas: ${datePart} ${hora}`);
  }

  // Devuelve el instante absoluto.
  return combined;
}
