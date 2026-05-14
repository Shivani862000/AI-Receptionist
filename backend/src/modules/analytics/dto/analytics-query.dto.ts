import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional } from "class-validator";

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ["day", "week", "month"], default: "day" })
  @IsOptional()
  @IsIn(["day", "week", "month"])
  groupBy?: "day" | "week" | "month" = "day";

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
