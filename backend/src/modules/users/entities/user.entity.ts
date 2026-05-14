import { ApiProperty } from "@nestjs/swagger";

import { BaseEntity } from "../../../common/entities/base.entity";

export class UserEntity extends BaseEntity {
  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  isActive!: boolean;
}
