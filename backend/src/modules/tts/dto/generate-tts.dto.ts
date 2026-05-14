import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GenerateTtsDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiPropertyOptional({ default: "aura-asteria-en" })
  @IsOptional()
  @IsString()
  voice?: string;
}
