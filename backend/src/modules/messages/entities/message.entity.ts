import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel } from "@prisma/client";

import { ApiMessageDirection, ApiMessageStatus } from "../dto/list-messages.dto";

export class MessageEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiPropertyOptional()
  clientId!: string | null;

  @ApiProperty({ enum: MessageChannel })
  channel!: MessageChannel;

  @ApiProperty({ enum: ApiMessageDirection })
  direction!: ApiMessageDirection;

  @ApiProperty({ enum: ApiMessageStatus })
  status!: ApiMessageStatus;

  @ApiPropertyOptional()
  subject!: string | null;

  @ApiPropertyOptional()
  content!: string | null;

  @ApiPropertyOptional()
  providerMessageId!: string | null;

  @ApiPropertyOptional()
  metadata!: unknown;

  @ApiPropertyOptional()
  sentAt!: Date | null;

  @ApiPropertyOptional()
  deliveredAt!: Date | null;

  @ApiPropertyOptional()
  readAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  fromAddress!: string | null;

  @ApiPropertyOptional()
  toAddress!: string | null;
}
