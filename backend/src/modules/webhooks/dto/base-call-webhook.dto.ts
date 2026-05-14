import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CallStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class BaseCallWebhookDto {
  @ApiProperty()
  @IsString()
  callSid!: string;

  @ApiProperty()
  @IsString()
  from!: string;

  @ApiProperty()
  @IsString()
  to!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({ enum: CallStatus })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;
}
