import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateTextMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ enum: MessageChannel })
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @ApiProperty()
  @IsString()
  toAddress!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyHtml?: string;
}
