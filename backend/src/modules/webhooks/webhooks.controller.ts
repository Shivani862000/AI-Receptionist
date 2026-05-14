import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "../../common/decorators/public.decorator";
import { BaseCallWebhookDto } from "./dto/base-call-webhook.dto";
import { WebhooksService } from "./webhooks.service";

@ApiTags("Webhooks")
@Public()
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("call/incoming")
  @ApiOperation({ summary: "Simulate provider incoming call webhook" })
  incoming(@Body() payload: BaseCallWebhookDto) {
    return this.webhooksService.handleIncoming(payload);
  }

  @Post("call/status")
  @ApiOperation({ summary: "Simulate provider call status webhook" })
  status(@Body() payload: BaseCallWebhookDto) {
    return this.webhooksService.handleStatus(payload);
  }

  @Post("call/completed")
  @ApiOperation({ summary: "Simulate provider completed call webhook and trigger pipeline" })
  completed(@Body() payload: BaseCallWebhookDto) {
    return this.webhooksService.handleCompleted(payload);
  }
}
