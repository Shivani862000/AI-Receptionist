import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class TranscribeAudioDto {
  @ApiPropertyOptional({ example: "https://example.com/audio.wav" })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  callId?: string;

  @ApiPropertyOptional({ default: "en" })
  @IsOptional()
  @IsString()
  language?: string = "en";
}
