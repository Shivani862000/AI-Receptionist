import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class GenerateTranscriptDto {
  @ApiPropertyOptional({ default: "deepgram" })
  @IsOptional()
  @IsString()
  provider?: string = "deepgram";

  @ApiPropertyOptional({ default: "en" })
  @IsOptional()
  @IsString()
  language?: string = "en";

  @ApiPropertyOptional({ default: 0.92 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number = 0.92;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audioUrl?: string;
}
