import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class ToggleAutomationDto {
  @ApiPropertyOptional({ description: "Optional explicit state. If omitted, the current state is inverted." })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
