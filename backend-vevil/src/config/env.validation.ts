import { plainToInstance, Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('❌ ERROR: Variables de entorno inválidas:');
    errors.forEach((error) => {
      console.error(`   - ${error.property}: ${Object.values(error.constraints || {}).join(', ')}`);
    });
    throw new Error(`Validación de variables de entorno fallida: ${errors.length} error(es)`);
  }

  return validatedConfig;
}
