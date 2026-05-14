import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageChannel, MessageTemplateType } from "@prisma/client";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: MessageChannel })
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @ApiProperty({ enum: MessageTemplateType })
  @IsEnum(MessageTemplateType)
  templateType!: MessageTemplateType;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  variables?: string[];
}
