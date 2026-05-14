import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AutomationActionType,
  AutomationChannel,
  AutomationScheduleType,
  AutomationTriggerType
} from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from "class-validator";

export class CreateAutomationDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AutomationTriggerType })
  @IsEnum(AutomationTriggerType)
  triggerType!: AutomationTriggerType;

  @ApiProperty({ enum: AutomationChannel })
  @IsEnum(AutomationChannel)
  channel!: AutomationChannel;

  @ApiProperty({ enum: AutomationActionType })
  @IsEnum(AutomationActionType)
  actionType!: AutomationActionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ enum: AutomationScheduleType, default: AutomationScheduleType.instant })
  @IsEnum(AutomationScheduleType)
  @IsOptional()
  scheduleType?: AutomationScheduleType = AutomationScheduleType.instant;

  @ApiPropertyOptional({ description: "Examples: 10:00, 15m, 2d, cron:0 9 * * *" })
  @IsOptional()
  @IsString()
  scheduleValue?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: "Optional extra trigger config for POC scans" })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Optional execution and retry config" })
  @IsOptional()
  @IsObject()
  executionRules?: Record<string, unknown>;
}
