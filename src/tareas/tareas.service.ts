// Importa el decorador para declarar el servicio y el decorador de cronjobs.
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

// Importa el decorador para inyectar repositorios TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio utilizado por las tareas automáticas.
import { Repository } from 'typeorm';

// Importa las entidades que serán revisadas y actualizadas.
import { Arbol } from '../arbol/entities/arbol.entity';
import { Cuidado } from '../cuidado/entities/cuidado.entity';

// Importa el servicio que procesa recordatorios pendientes.
import { RecordatorioService } from '../recordatorio/recordatorio.service';

// Ejecuta las tareas periódicas de recordatorios y cuidados vencidos.
@Injectable()
export class TareasService {
  // Configura repositorios y servicios necesarios para el procesamiento automático.
  constructor(
    // Permite buscar cuidados pendientes vencidos.
    @InjectRepository(Cuidado)
    private readonly cuidadoRepository: Repository<Cuidado>,

    // Permite actualizar el estado de salud de los árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,

    // Permite localizar y marcar recordatorios vencidos.
    private readonly recordatorioService: RecordatorioService,
  ) {}

  // Ejecuta el proceso cada hora usando explícitamente la zona UTC.
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'procesar-recordatorios-y-cuidados-vencidos',
    timeZone: 'UTC',
  })
  async procesarTareasAutomaticas(): Promise<void> {
    // Captura el instante actual como fecha absoluta UTC.
    const ahoraUtc = new Date();

    // Busca los recordatorios pendientes cuya fecha ya llegó.
    const recordatorios = await this.recordatorioService.findPendingDue(
      ahoraUtc,
    );

    // Marca cada recordatorio vencido como pendiente de atención.
    for (const recordatorio of recordatorios) {
      await this.recordatorioService.markAsDue(recordatorio);
    }

    // Busca cuidados pendientes junto con sus árboles relacionados.
    const cuidadosPendientes = await this.cuidadoRepository.find({
      where: { estado: 'pendiente' },
      relations: { arbol: true },
    });

    // Revisa cada cuidado para detectar incumplimientos.
    for (const cuidado of cuidadosPendientes) {
      // Convierte la fecha programada en un instante UTC comparable.
      const fechaProgramadaUtc = new Date(cuidado.fecha_programada);

      // Ignora actividades cuya fecha todavía no ha llegado.
      if (fechaProgramadaUtc.getTime() > ahoraUtc.getTime()) {
        continue;
      }

      // Actualiza la salud del árbol solo si aún no requiere atención.
      if (cuidado.arbol.estado_salud !== 'requiere_atencion') {
        // Marca el árbol para que el usuario atienda el cuidado vencido.
        cuidado.arbol.estado_salud = 'requiere_atencion';

        // Persiste el nuevo estado de salud.
        await this.arbolRepository.save(cuidado.arbol);
      }
    }
  }
}
