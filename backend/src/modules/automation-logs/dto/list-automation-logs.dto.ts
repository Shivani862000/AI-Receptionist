import { ApiPropertyOptional } from "@nestjs/swagger";
import { AutomationExecutionStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListAutomationLogsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AutomationExecutionStatus })
  @IsOptional()
  @IsEnum(AutomationExecutionStatus)
  status?: AutomationExecutionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  automationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}
