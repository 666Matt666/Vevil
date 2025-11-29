import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './entities/user-role.enum';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Inyectamos el repositorio de la entidad User.
  // NestJS y TypeORM se encargan de la magia para que 'userRepository'
  // tenga todos los métodos para interactuar con la tabla 'users'.
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Encuentra todos los usuarios en la base de datos.
   * @param paginationQuery DTO con los parámetros de paginación (page, limit).
   * @returns Una promesa que resuelve a un array de usuarios.
   */
  findAll(paginationQuery: PaginationQueryDto): Promise<[User[], number]> {
    const { limit, page, sortBy, order, search } = paginationQuery;

    const queryOptions = {
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order },
      where: [],
    };

    if (search) {
      queryOptions.where = [
        { name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ];
    }

    return this.userRepository.findAndCount(queryOptions);
  }

  /**
   * Encuentra un usuario por su ID.
   * @param id El ID del usuario a buscar (UUID).
   * @returns El usuario encontrado.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      // Si no se encuentra el usuario, lanza una excepción que NestJS
      // convertirá en una respuesta HTTP 404 Not Found.
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * Encuentra un usuario por su email.
   * Este método es especial para la autenticación, por lo que necesita
   * recuperar la contraseña que por defecto está oculta.
   * @param email El email del usuario a buscar.
   * @returns El usuario encontrado, incluyendo la contraseña.
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // ¡Importante! Seleccionamos explícitamente la contraseña.
      .getOne();
  }

  /**
   * Actualiza un usuario por su ID.
   * @param id El ID del usuario a actualizar.
   * @param updateUserDto Los datos a actualizar.
   * @returns El usuario actualizado.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Si se está intentando actualizar la contraseña, la encriptamos.
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // `preload` busca el usuario por ID y fusiona los nuevos datos del DTO.
    // Si el usuario no existe, retorna `undefined`.
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return this.userRepository.save(user);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id El ID del usuario a eliminar.
   */
  async remove(id: string): Promise<void> {
    // El método .delete() de TypeORM ejecuta la consulta y devuelve un objeto
    // con el número de filas afectadas.
    const deleteResult = await this.userRepository.delete(id);

    // Si ninguna fila fue afectada, significa que el usuario no fue encontrado.
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param createUserDto Los datos para crear el nuevo usuario.
   * @returns El usuario guardado (sin la contraseña).
   */
  async create( // 1. Asegurarse de que el método create exista y esté bien definido
    createUserDto: CreateUserDto,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
    const { name, email, password } = createUserDto; // Ahora 'name' existe

    // 1. Verificar si el email ya está en uso
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear la nueva entidad de usuario con los datos y la contraseña encriptada
    const user = this.userRepository.create({ ...createUserDto, password: hashedPassword, role });

    // 4. Guardar el nuevo usuario en la base de datos
    return this.userRepository.save(user);
  }

  /**
   * Asigna la ruta de un avatar a un usuario.
   * @param userId El ID del usuario.
   * @param avatarFilename El nombre del archivo guardado.
   */
  async setAvatar(userId: string, avatarFilename: string): Promise<User> {
    return this.update(userId, { avatarPath: avatarFilename });
  }

  /**
   * Cuenta el número total de usuarios.
   */
  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOne(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, hashedRefreshToken, ...result } = user;
      return result;
    } else {
      throw new UnauthorizedException('Acceso denegado');
    }
  }
}