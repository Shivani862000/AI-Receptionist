import { ApiPropertyOptional } from "@nestjs/swagger";
import { CallDirection, CallStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListVoiceCallsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CallStatus })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @ApiPropertyOptional({ enum: CallDirection })
  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @ApiPropertyOptional({ description: "Search by customer phone or from/to number" })
  @IsOptional()
  @IsString()
  phone?: string;
}
