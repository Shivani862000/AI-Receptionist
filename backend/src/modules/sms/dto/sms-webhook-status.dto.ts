import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { ApiMessageStatus } from "../../messages/dto/list-messages.dto";

export class SmsWebhookStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiProperty()
  @IsString()
  providerMessageId!: string;

  @ApiProperty({ enum: ApiMessageStatus })
  @IsEnum(ApiMessageStatus)
  status!: ApiMessageStatus;
}
