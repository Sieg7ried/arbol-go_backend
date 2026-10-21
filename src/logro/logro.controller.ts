import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LogroService } from './logro.service';
import { CreateLogroDto } from './dto/create-logro.dto';
import { UpdateLogroDto } from './dto/update-logro.dto';
import { Logro } from './entities/logro.entity';

@Controller('logro')
export class LogroController {
  constructor(private readonly logroService: LogroService) {}

  // POST /logro
  @Post()
  create(@Body() createLogroDto: CreateLogroDto): Promise<Logro> {
    return this.logroService.create(createLogroDto);
  }

  // GET /logro
  @Get()
  findAll(): Promise<Logro[]> {
    return this.logroService.findAll();
  }

  // GET /logro/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Logro> {
    return this.logroService.findOne(id);
  }

  // PATCH /logro/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogroDto: UpdateLogroDto,
  ): Promise<Logro> {
    return this.logroService.update(id, updateLogroDto);
  }

  // DELETE /logro/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.logroService.remove(id);
  }
}
