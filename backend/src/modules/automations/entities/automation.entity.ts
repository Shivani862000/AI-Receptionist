import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AutomationActionType,
  AutomationChannel,
  AutomationScheduleType,
  AutomationTriggerType
} from "@prisma/client";

import { BaseEntity } from "../../../common/entities/base.entity";

export class AutomationEntity extends BaseEntity {
  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({ enum: AutomationTriggerType })
  triggerType!: AutomationTriggerType;

  @ApiProperty({ enum: AutomationChannel })
  channel!: AutomationChannel;

  @ApiProperty({ enum: AutomationActionType })
  actionType!: AutomationActionType;

  @ApiPropertyOptional()
  templateId?: string | null;

  @ApiProperty({ enum: AutomationScheduleType })
  scheduleType!: AutomationScheduleType;

  @ApiPropertyOptional()
  scheduleValue?: string | null;

  @ApiProperty()
  isActive!: boolean;
}
