import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OnboardingStep } from "@prisma/client";
import { IsArray, IsBoolean, IsEnum, IsOptional } from "class-validator";

export class UpdateOnboardingDto {
  @ApiProperty({ enum: OnboardingStep })
  @IsEnum(OnboardingStep)
  currentStep!: OnboardingStep;

  @ApiPropertyOptional({ type: [String], enum: OnboardingStep })
  @IsOptional()
  @IsArray()
  completedSteps?: OnboardingStep[];

  @ApiPropertyOptional({ type: [String], enum: OnboardingStep })
  @IsOptional()
  @IsArray()
  skippedSteps?: OnboardingStep[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  twilioConnected?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappConfigured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  businessInfoUploaded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  testCallCompleted?: boolean;
}
