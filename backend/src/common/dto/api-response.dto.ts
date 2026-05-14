import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiErrorDetailDto {
  @ApiProperty()
  field!: string;

  @ApiProperty()
  message!: string;
}

export class ApiErrorDto {
  @ApiProperty()
  code!: string;

  @ApiPropertyOptional({ type: [ApiErrorDetailDto], nullable: true })
  details?: ApiErrorDetailDto[] | null;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  data!: T;

  @ApiPropertyOptional()
  meta?: Record<string, unknown>;
}
