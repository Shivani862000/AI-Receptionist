import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel, MessageDirection, MessageStatus } from "@prisma/client";

import { BaseEntity } from "../../../common/entities/base.entity";

export class TextMessageEntity extends BaseEntity {
  @ApiProperty({ enum: MessageChannel })
  channel!: MessageChannel;

  @ApiProperty({ enum: MessageDirection })
  direction!: MessageDirection;

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty()
  toAddress!: string;

  @ApiPropertyOptional()
  previewText?: string | null;
}
