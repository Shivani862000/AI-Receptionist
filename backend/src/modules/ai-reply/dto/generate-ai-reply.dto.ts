import { ApiProperty } from "@nestjs/swagger";
import { MessageChannel } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class GenerateAiReplyDto {
  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty({ enum: MessageChannel })
  @IsEnum(MessageChannel)
  channel!: MessageChannel;
}
