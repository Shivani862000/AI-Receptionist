import { ApiPropertyOptional } from "@nestjs/swagger";
import { ContactMode } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListClientsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ enum: ContactMode })
  @IsOptional()
  @IsEnum(ContactMode)
  preferredContactMode?: ContactMode;
}
