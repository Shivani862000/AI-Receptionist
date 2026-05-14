import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class TwilioVoiceWebhookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  CallSid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  From?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  To?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  CallStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  SpeechResult?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  RecordingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  RecordingSid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  RecordingDuration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  CallDuration?: string;
}
