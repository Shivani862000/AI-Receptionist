import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class UpdateAiSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  greetingMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voiceSelection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessInstructions?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  fallbackRules?: Record<string, unknown>;
}
