import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class ExportReportDto {
  @ApiPropertyOptional({ example: "cmcall123" })
  @IsOptional()
  @IsString()
  callId?: string;

  @ApiPropertyOptional({ example: "cmclient123" })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: "2026-05-11" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: "2026-05-11" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
