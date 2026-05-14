import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GenerateAiSummaryDto {
  @ApiPropertyOptional({ default: "gemini-2.5-flash-preview" })
  @IsOptional()
  @IsString()
  modelName?: string = "gemini-2.5-flash-preview";
}
