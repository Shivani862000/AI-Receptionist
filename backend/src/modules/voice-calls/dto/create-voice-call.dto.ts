import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CallDirection } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateVoiceCallDto {
  @ApiPropertyOptional({ description: "Optional business id override for local POC testing" })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty()
  @IsString()
  customerPhone!: string;

  @ApiPropertyOptional({ description: "Optional mocked provider sid. Auto-generated if omitted." })
  @IsOptional()
  @IsString()
  callSid?: string;

  @ApiPropertyOptional({ enum: CallDirection, default: CallDirection.outgoing })
  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection = CallDirection.outgoing;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toNumber?: string;
}
