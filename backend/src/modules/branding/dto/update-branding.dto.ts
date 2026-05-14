import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class UpdateBrandingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailFooter?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  pdfBranding?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customDomain?: string;
}
