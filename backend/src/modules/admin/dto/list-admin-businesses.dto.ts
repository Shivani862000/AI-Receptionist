import { ApiPropertyOptional } from "@nestjs/swagger";
import { SubscriptionPlanName } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListAdminBusinessesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SubscriptionPlanName })
  @IsOptional()
  @IsEnum(SubscriptionPlanName)
  planName?: SubscriptionPlanName;
}
