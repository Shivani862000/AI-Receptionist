import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class AudioChunkDto {
  @ApiPropertyOptional()
  @IsString()
  sessionId!: string;

  @ApiPropertyOptional({ description: "Base64 audio chunk payload" })
  @IsOptional()
  @IsString()
  audioBase64?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sampleRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @ApiPropertyOptional({ description: "Text fallback for local browser testing" })
  @IsOptional()
  @IsString()
  @MaxLength(800)
  textHint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transport?: string;
}
