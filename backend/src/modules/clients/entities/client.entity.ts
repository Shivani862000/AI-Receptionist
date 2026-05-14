import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContactMode, Gender } from "@prisma/client";

import { BaseEntity } from "../../../common/entities/base.entity";

export class ClientEntity extends BaseEntity {
  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender | null;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional()
  whatsapp?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional({ enum: ContactMode })
  preferredContactMode?: ContactMode | null;
}
