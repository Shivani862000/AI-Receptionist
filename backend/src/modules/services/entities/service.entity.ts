import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { BaseEntity } from "../../../common/entities/base.entity";

export class ServiceEntity extends BaseEntity {
  @ApiProperty()
  serviceName!: string;

  @ApiProperty()
  serviceCode!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  price?: number | null;

  @ApiPropertyOptional()
  duration?: number | null;

  @ApiProperty()
  isActive!: boolean;
}
