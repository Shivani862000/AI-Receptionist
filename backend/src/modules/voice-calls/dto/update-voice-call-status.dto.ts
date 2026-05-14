import { ApiProperty } from "@nestjs/swagger";
import { CallStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateVoiceCallStatusDto {
  @ApiProperty({ enum: CallStatus })
  @IsEnum(CallStatus)
  status!: CallStatus;
}
