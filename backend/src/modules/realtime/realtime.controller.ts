import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ListLiveSessionsDto } from "./dto/list-live-sessions.dto";
import { RealtimeService } from "./realtime.service";

@ApiTags("Realtime")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get("live-sessions")
  @ApiOperation({ summary: "List live conversation sessions" })
  list(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListLiveSessionsDto) {
    return this.realtimeService.listSessions(currentUser, query);
  }

  @Get("live-sessions/:id")
  @ApiOperation({ summary: "Get a single live conversation session" })
  one(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.realtimeService.getSession(currentUser, id);
  }

  @Get("realtime/active-sessions")
  @ApiOperation({ summary: "Get active realtime sessions for the monitoring dashboard" })
  active(@CurrentUser() currentUser: CurrentUserType) {
    return this.realtimeService.activeSessions(currentUser);
  }
}
