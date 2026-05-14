import { ApiProperty } from "@nestjs/swagger";
import { SubscriptionPlanName } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpgradeSubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlanName })
  @IsEnum(SubscriptionPlanName)
  planName!: SubscriptionPlanName;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
