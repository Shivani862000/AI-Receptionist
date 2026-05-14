import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { CreateTextMessageDto } from "./create-text-message.dto";

export class UpdateTextMessageDto extends PartialType(CreateTextMessageDto) {
  @ApiPropertyOptional({ enum: MessageStatus })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewText?: string;
}
