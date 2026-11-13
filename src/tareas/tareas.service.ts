import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { Recordatorio } from '../recordatorio/entities/recordatorio.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import {
  combineUtcDateAndTime,
  toUtcDatePart,
  toUtcTimePart,
} from '../common/fecha.util';
import {
  calcularSiguienteOcurrencia,
  esRepeticionProgramada,
} from './repeticion.util';
import { EstadoCuidadoEnum } from '../common/enums/estado-cuidado.enum';
import { EstadoRecordatorioEnum } from '../common/enums/estado-recordatorio.enum';
import { EstadoSaludEnum } from '../common/enums/estado-salud.enum';
import { RepeticionEnum } from '../common/enums/repeticion.enum';

const ESTADO_CUIDADO_PENDIENTE = EstadoCuidadoEnum.PENDIENTE;
const ESTADO_CUIDADO_VENCIDO = EstadoCuidadoEnum.VENCIDO;
const ESTADO_RECORDATORIO_PENDIENTE = EstadoRecordatorioEnum.PENDIENTE;
const ESTADO_RECORDATORIO_PENDIENTE_ATENCION =
  EstadoRecordatorioEnum.PENDIENTE_ATENCION;
const ESTADO_RECORDATORIO_PROCESANDO = EstadoRecordatorioEnum.PROCESANDO;
const MINUTOS_LEASE_PROCESAMIENTO = 120;
const TAMANO_LOTE_RECORDATORIOS = 100;

@Injectable()
export class TareasService {
  private readonly logger = new Logger(TareasService.name);

  constructor(
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,

    private readonly dataSource: DataSource,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'procesar-recordatorios-y-cuidados-vencidos',
    timeZone: 'UTC',
  })
  async procesarTareasAutomaticas(): Promise<void> {
    const ahoraUtc = new Date();
    const ahoraSql = ahoraUtc.toISOString().replace('T', ' ').replace('Z', '');

    // Recupera reclamaciones abandonadas por un reinicio o caída del proceso.
    // El plazo excede una ejecución normal y evita dejar recordatorios bloqueados indefinidamente.
    await this.recordatorioRepository
      .createQueryBuilder()
      .update(Recordatorio)
      .set({
        estado: ESTADO_RECORDATORIO_PENDIENTE,
        procesando_desde: null,
      })
      .where(
        `estado = :procesando AND procesando_desde <= DATE_SUB(:ahora, INTERVAL ${MINUTOS_LEASE_PROCESAMIENTO} MINUTE)`,
        {
          procesando: ESTADO_RECORDATORIO_PROCESANDO,
          ahora: ahoraSql,
        },
      )
      .execute();

    // La base actualiza solo cuidados pendientes cuya fecha programada ya venció.
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Cuidado)
        .createQueryBuilder()
        .update(Cuidado)
        .set({ estado: ESTADO_CUIDADO_VENCIDO })
        .where('estado = :pendiente AND fecha_programada <= :ahora', {
          pendiente: ESTADO_CUIDADO_PENDIENTE,
          ahora: ahoraSql,
        })
        .execute();

      // Cambia en bloque la salud de los árboles que tienen un cuidado vencido,
      // sin materializar entidades de cuidados ni árboles en memoria.
      await manager.query(
        'UPDATE `arbol` a INNER JOIN `cuidado` c ON c.`id_arbol` = a.`id_arbol` SET a.`estado_salud` = ? WHERE c.`estado` = ? AND c.`fecha_programada` <= ? AND a.`estado_salud` <> ?',
        [
          EstadoSaludEnum.REQUIERE_ATENCION,
          ESTADO_CUIDADO_VENCIDO,
          ahoraSql,
          EstadoSaludEnum.REQUIERE_ATENCION,
        ],
      );
    });

    // Solo se seleccionan recordatorios pendientes ya vencidos y los campos necesarios
    // para enviar la notificación y calcular su próxima ocurrencia.
    let ultimoIdProcesado = 0;
    while (true) {
      // Lee un lote acotado y pagina por ID para que miles de vencimientos no se hidraten juntos.
      const recordatoriosVencidos = await this.recordatorioRepository
        .createQueryBuilder('recordatorio')
        .select([
          'recordatorio.id_recordatorio',
          'recordatorio.id_arbol',
          'recordatorio.titulo',
          'recordatorio.descripcion',
          'recordatorio.fecha',
          'recordatorio.hora',
          'recordatorio.repeticion',
          'recordatorio.dia_repeticion',
        ])
        .where('recordatorio.estado = :pendiente', {
          pendiente: ESTADO_RECORDATORIO_PENDIENTE,
        })
        .andWhere(
          'TIMESTAMP(recordatorio.fecha, recordatorio.hora) <= :ahora',
          { ahora: ahoraSql },
        )
        .andWhere('recordatorio.id_recordatorio > :ultimoId', {
          ultimoId: ultimoIdProcesado,
        })
        .orderBy('recordatorio.id_recordatorio', 'ASC')
        .take(TAMANO_LOTE_RECORDATORIOS)
        .getMany();

      // No quedan filas posteriores al cursor que cumplan el criterio de vencimiento.
      if (recordatoriosVencidos.length === 0) {
        break;
      }

      for (const recordatorio of recordatoriosVencidos) {
        // Avanza el cursor incluso cuando otra instancia ya reclamó el registro.
        ultimoIdProcesado = recordatorio.id_recordatorio;
        // Reclama atómicamente cada fila antes de enviar el push para evitar duplicados
        // si coinciden dos ejecuciones del cron o dos instancias del backend.
        const reclamo = await this.recordatorioRepository
          .createQueryBuilder()
          .update(Recordatorio)
          .set({
            estado: ESTADO_RECORDATORIO_PROCESANDO,
            procesando_desde: ahoraUtc,
          })
          .where(
            'id_recordatorio = :id AND estado = :pendiente AND TIMESTAMP(fecha, hora) <= :ahora',
            {
              id: recordatorio.id_recordatorio,
              pendiente: ESTADO_RECORDATORIO_PENDIENTE,
              ahora: ahoraSql,
            },
          )
          .execute();

        // Otra ejecución pudo reclamar o actualizar la fila después de la consulta inicial.
        if (!reclamo.affected) {
          continue;
        }

        try {
          // El servicio localiza el token del propietario y envía el mensaje por Firebase.
          await this.notificacionesService.enviarPushDeRecordatorio(
            recordatorio.id_arbol,
            recordatorio.id_recordatorio,
            recordatorio.titulo,
            recordatorio.descripcion ?? recordatorio.titulo,
          );
        } catch (error) {
          // Recupera la fila para que el cron vuelva a intentar el envío en su próxima pasada.
          try {
            await this.recordatorioRepository.update(
              {
                id_recordatorio: recordatorio.id_recordatorio,
                estado: ESTADO_RECORDATORIO_PROCESANDO,
              },
              {
                estado: ESTADO_RECORDATORIO_PENDIENTE,
                procesando_desde: null,
              },
            );
          } catch (recoveryError) {
            // El lease permite recuperar esta fila en otra ejecución aunque falle el reencolado.
            this.logger.error(
              `No se pudo liberar el recordatorio ${recordatorio.id_recordatorio}`,
              recoveryError instanceof Error
                ? recoveryError.stack
                : String(recoveryError),
            );
          }
          this.logger.error(
            `No se pudo enviar el recordatorio ${recordatorio.id_recordatorio}; se reintentará`,
            error instanceof Error ? error.stack : String(error),
          );
          continue;
        }

        const repeticion = recordatorio.repeticion;

        // Las frecuencias soportadas calculan y persisten la próxima ocurrencia.
        if (esRepeticionProgramada(repeticion)) {
          const ocurrenciaActual = combineUtcDateAndTime(
            recordatorio.fecha,
            recordatorio.hora,
          );
          const diaAncla =
            recordatorio.dia_repeticion ?? ocurrenciaActual.getUTCDate();
          const siguienteFecha = calcularSiguienteOcurrencia(
            ocurrenciaActual,
            repeticion,
            diaAncla,
            ahoraUtc,
          );

          // El estado vuelve a pendiente para activar la ocurrencia futura.
          await this.recordatorioRepository.update(
            {
              id_recordatorio: recordatorio.id_recordatorio,
              estado: ESTADO_RECORDATORIO_PROCESANDO,
            },
            {
              fecha: new Date(`${toUtcDatePart(siguienteFecha)}T00:00:00.000Z`),
              hora: toUtcTimePart(siguienteFecha),
              dia_repeticion:
                repeticion === RepeticionEnum.MENSUAL ? diaAncla : null,
              estado: ESTADO_RECORDATORIO_PENDIENTE,
              procesando_desde: null,
            },
          );
          continue;
        }

        // Valores desconocidos se registran y se procesan una sola vez, nunca se repiten.
        if (repeticion !== RepeticionEnum.NINGUNA) {
          this.logger.warn(
            `Repetición desconocida "${recordatorio.repeticion}" en el recordatorio ${recordatorio.id_recordatorio}; se tratará como única`,
          );
        }

        // Los recordatorios únicos salen de la cola pendiente tras el intento de notificación.
        await this.recordatorioRepository.update(
          {
            id_recordatorio: recordatorio.id_recordatorio,
            estado: ESTADO_RECORDATORIO_PROCESANDO,
          },
          {
            estado: ESTADO_RECORDATORIO_PENDIENTE_ATENCION,
            procesando_desde: null,
          },
        );
      }
    }
  }
}
