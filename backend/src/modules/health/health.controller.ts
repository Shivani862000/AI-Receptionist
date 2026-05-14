import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Public()
@Controller({
  path: "health",
  version: VERSION_NEUTRAL
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Application health check" })
  async getHealth() {
    return {
      data: await this.healthService.getHealth()
    };
  }
}
