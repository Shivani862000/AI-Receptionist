import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReportType } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional } from "class-validator";

export class ExportPdfDto {
  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
