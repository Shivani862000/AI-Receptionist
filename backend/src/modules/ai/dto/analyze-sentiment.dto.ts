import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AiAnalyzeSentimentDto {
  @ApiProperty()
  @IsString()
  text!: string;
}
