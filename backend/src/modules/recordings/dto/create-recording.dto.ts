import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateRecordingDto {
  @ApiPropertyOptional({ default: "mock-storage" })
  @IsOptional()
  @IsString()
  provider?: string = "mock-storage";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @ApiPropertyOptional({ default: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
