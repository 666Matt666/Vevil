import { Body, Controller, Delete, ForbiddenException, FileTypeValidator, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // Asegúrate de que multer esté instalado: npm install multer @types/multer
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserRole } from './entities/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Aseguramos que la ruta sea relativa
import { Roles } from '@/auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { ExcludePasswordInterceptor } from '@/common/interceptors/exclude-password.interceptor';
import { PaginatedUsersResponseDto } from '@/users/dto/paginated-users-response.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { editFileName } from '@/users/utils/file-naming.util';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') // Agrupa todos los endpoints de este controlador bajo la etiqueta "Users"
@Controller('users')
@UseInterceptors(ExcludePasswordInterceptor)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario (Solo para Admins)' })
  @ApiResponse({ status: 201, description: 'El usuario ha sido creado exitosamente.', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden. No tienes permiso.' })
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Gracias al ValidationPipe, si los datos en createUserDto no son válidos,
    // NestJS devolverá automáticamente un error 400 Bad Request.
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios paginada.', type: PaginatedUsersResponseDto })
  @UseInterceptors(CacheInterceptor) // ¡Aquí está la magia!
  @ApiBearerAuth() // Indica a Swagger que este endpoint requiere un token
  async findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedUsersResponseDto> {
    const [users, total] = await this.usersService.findAll(paginationQuery);
    return { data: users, total };
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      // Usamos diskStorage para tener control total sobre el archivo
      storage: diskStorage({
        destination: './uploads', // El directorio donde se guardarán los archivos
        filename: editFileName, // La función que acabamos de crear para renombrar el archivo
      }),
    }),
  )
  uploadAvatar(
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Validador para el tamaño máximo del archivo (ej. 1MB)
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          // Validador para el tipo de archivo (expresión regular para imágenes)
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    // Aquí, 'file' contiene toda la información del archivo subido (nombre, path, tamaño, etc.)
    // Y 'user' es el usuario autenticado que está subiendo el archivo.
    return this.usersService.setAvatar(user.id, file.filename);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    // Si el usuario no es admin y está intentando editar a otro usuario
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('You are not allowed to perform this action');
    }

    // Si un usuario no-admin intenta cambiar su propio rol, se lo impedimos.
    if (user.role !== UserRole.ADMIN && updateUserDto.role) {
      throw new ForbiddenException('You are not allowed to change your own role.');
      // Alternativamente, podríamos simplemente eliminar el campo para que no se procese:
      // delete updateUserDto.role;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT) // Devuelve 204 No Content en caso de éxito
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}