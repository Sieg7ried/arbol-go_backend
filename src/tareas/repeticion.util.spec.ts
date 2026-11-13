import {
  calcularSiguienteOcurrencia,
  esRepeticionProgramada,
} from './repeticion.util';
import { RepeticionEnum } from '../common/enums/repeticion.enum';

describe('recordatorio recurrence', () => {
  it('moves a daily reminder to the first future occurrence after downtime', () => {
    const scheduled = new Date('2026-11-01T10:30:00.000Z');
    const now = new Date('2026-11-04T11:00:00.000Z');

    expect(
      calcularSiguienteOcurrencia(
        scheduled,
        RepeticionEnum.DIARIA,
        1,
        now,
      ).toISOString(),
    ).toBe('2026-11-05T10:30:00.000Z');
  });

  it('moves a weekly reminder by complete weekly intervals', () => {
    const scheduled = new Date('2026-11-01T10:30:00.000Z');
    const now = new Date('2026-11-17T11:00:00.000Z');

    expect(
      calcularSiguienteOcurrencia(
        scheduled,
        RepeticionEnum.SEMANAL,
        1,
        now,
      ).toISOString(),
    ).toBe('2026-11-22T10:30:00.000Z');
  });

  it('preserves the monthly day anchor across February', () => {
    const januaryOccurrence = new Date('2027-01-31T09:15:00.000Z');
    const februaryOccurrence = calcularSiguienteOcurrencia(
      januaryOccurrence,
      RepeticionEnum.MENSUAL,
      31,
      new Date('2027-01-31T09:16:00.000Z'),
    );

    expect(februaryOccurrence.toISOString()).toBe('2027-02-28T09:15:00.000Z');
    expect(
      calcularSiguienteOcurrencia(
        februaryOccurrence,
        RepeticionEnum.MENSUAL,
        31,
        new Date('2027-02-28T09:16:00.000Z'),
      ).toISOString(),
    ).toBe('2027-03-31T09:15:00.000Z');
  });

  it('does not repeat unsupported values', () => {
    expect(esRepeticionProgramada(RepeticionEnum.SEMANAL)).toBe(true);
    expect(esRepeticionProgramada('cada_dos_dias')).toBe(false);
  });
});
