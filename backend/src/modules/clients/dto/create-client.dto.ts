import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContactMode, Gender } from "@prisma/client";
import { IsArray, IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ContactMode })
  @IsOptional()
  @IsEnum(ContactMode)
  preferredContactMode?: ContactMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredContactTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  serviceIds?: string[];
}
