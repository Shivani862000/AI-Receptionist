import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { BaseEntity } from "../../../common/entities/base.entity";

export class BusinessEntity extends BaseEntity {
  @ApiProperty()
  businessName!: string;

  @ApiPropertyOptional()
  ownerName?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiPropertyOptional()
  logoUrl?: string | null;
}
