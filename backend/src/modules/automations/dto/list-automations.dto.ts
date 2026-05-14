import { ApiPropertyOptional } from "@nestjs/swagger";
import { AutomationChannel, AutomationTriggerType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListAutomationsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AutomationTriggerType })
  @IsOptional()
  @IsEnum(AutomationTriggerType)
  triggerType?: AutomationTriggerType;

  @ApiPropertyOptional({ enum: AutomationChannel })
  @IsOptional()
  @IsEnum(AutomationChannel)
  channel?: AutomationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
