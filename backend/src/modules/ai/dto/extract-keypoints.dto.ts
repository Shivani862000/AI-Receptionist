import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AiExtractKeyPointsDto {
  @ApiProperty()
  @IsString()
  text!: string;
}
