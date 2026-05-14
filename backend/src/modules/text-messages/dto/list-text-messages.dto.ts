import { ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel, MessageStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class ListTextMessagesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MessageChannel })
  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;

  @ApiPropertyOptional({ enum: MessageStatus })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}
