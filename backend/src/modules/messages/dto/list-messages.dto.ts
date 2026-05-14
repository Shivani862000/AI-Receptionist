import { ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export enum ApiMessageDirection {
  incoming = "incoming",
  outgoing = "outgoing"
}

export enum ApiMessageStatus {
  queued = "queued",
  sent = "sent",
  delivered = "delivered",
  read = "read",
  failed = "failed"
}

export class ListMessagesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MessageChannel })
  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;

  @ApiPropertyOptional({ enum: ApiMessageStatus })
  @IsOptional()
  @IsEnum(ApiMessageStatus)
  status?: ApiMessageStatus;

  @ApiPropertyOptional({ enum: ApiMessageDirection })
  @IsOptional()
  @IsEnum(ApiMessageDirection)
  direction?: ApiMessageDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}
