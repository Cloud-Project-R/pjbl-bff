import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

/**
 * Formatos dos dados que o front envia ao BFF.
 *  - @ApiProperty: aparece no Swagger do BFF
 *  - @IsString, @IsInt...: o BFF já recusa (400) dados no formato errado,
 *    antes mesmo de chamar o microserviço. As regras de negócio continuam nos microserviços.
 */

export class SalaDto {
  @ApiProperty({ example: 'Sala 101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  capacidade: number;

  @ApiProperty({ example: 'UNI-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  universidadeId: string;
}

export class CriarReservaDto {
  @ApiProperty({ example: '6730f1c2a1b2c3d4e5f60718', description: 'Id da sala (vem de GET /salas)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  salaId: string;

  @ApiProperty({ example: 'A-10' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  alunoId: string;

  @ApiProperty({ example: 'UNI-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  universidadeId: string;

  @ApiProperty({ example: '2026-11-10T13:00:00Z' })
  @IsISO8601({ strict: true })
  inicio: string;

  @ApiProperty({ example: '2026-11-10T14:00:00Z' })
  @IsISO8601({ strict: true })
  fim: string;
}

export class AtualizarReservaDto {
  @ApiProperty({ example: '2026-11-10T15:00:00Z' })
  @IsISO8601({ strict: true })
  inicio: string;

  @ApiProperty({ example: '2026-11-10T16:00:00Z' })
  @IsISO8601({ strict: true })
  fim: string;
}
