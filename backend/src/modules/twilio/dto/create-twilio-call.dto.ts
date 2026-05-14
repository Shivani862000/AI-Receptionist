import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateTwilioCallDto {
  @ApiProperty()
  @IsString()
  customerName!: string;

  @ApiProperty()
  @IsString()
  customerPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}
