import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AiGenerateReplyDto {
  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty({ example: "whatsapp" })
  @IsString()
  channel!: string;
}
