import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class ListLiveSessionsDto {
  @ApiPropertyOptional({ enum: ["active", "completed", "all"] })
  @IsOptional()
  @IsIn(["active", "completed", "all"])
  scope?: "active" | "completed" | "all";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessId?: string;
}
