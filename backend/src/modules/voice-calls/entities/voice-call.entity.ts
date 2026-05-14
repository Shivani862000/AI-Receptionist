import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CallDirection, CallStatus, SentimentLabel } from "@prisma/client";

import { BaseEntity } from "../../../common/entities/base.entity";

export class VoiceCallEntity extends BaseEntity {
  @ApiProperty({ enum: CallDirection })
  direction!: CallDirection;

  @ApiProperty({ enum: CallStatus })
  status!: CallStatus;

  @ApiProperty()
  callSid!: string;

  @ApiProperty()
  customerPhone!: string;

  @ApiPropertyOptional()
  customerName?: string | null;

  @ApiPropertyOptional({ enum: SentimentLabel })
  sentiment?: SentimentLabel | null;
}
