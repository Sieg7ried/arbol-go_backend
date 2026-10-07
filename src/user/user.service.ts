import { 
  Injectable, 
  ConflictException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create_user.dto'


@Injectable()
export class UserService {
  constructor(
    // Inyección del repositorio de User
    @InjectRepository(User)
    private readonly userRepository: Repository <User>,
  ) {}

  /**
   * Crear un nuevo usuario
   * Encripta la contraseña antes de guardarla
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear nueva instancia de usuario
    const user: User = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Guardar en la base de datos
    return await this.userRepository.save(user);
  }

   /**
   * Obtener todos los usuarios
   * No incluye las contraseñas
   */
  async findAll(): Promise <User[]> {
    return await this.userRepository.find();
  }

   /**
   * Obtener un usuario por ID
   */
  async findOne(id: number): Promise <User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

   /**
   * Buscar un usuario por ID sin lanzar excepción
   * Devuelve null si no existe (lo usa la estrategia JWT)
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  /**
   * Buscar usuario por email
   * Incluye la contraseña (solo para autenticación)
   * Devuelve null si el email no está registrado
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });
  }

 /**
   * Eliminar un usuario (borrado físico del registro)
   */
  async remove(id: number): Promise<void> {
    const user: User = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
