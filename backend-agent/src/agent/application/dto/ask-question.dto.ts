import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO de entrada HTTP. Mantiene el nombre de campo "mensaje" que ya
 * usa tu controller. class-validator vive aquí (no en domain) porque
 * es detalle de framework: domain no debe saber que existe HTTP.
 */
export class AskQuestionDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío.' })
  @MinLength(3, { message: 'El mensaje es demasiado corto.' })
  @MaxLength(1000, {
    message: 'El mensaje es demasiado largo (máx. 1000 caracteres).',
  })
  mensaje!: string;
}
