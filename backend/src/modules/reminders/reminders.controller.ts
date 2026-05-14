import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TestReminderDto } from "./dto/test-reminder.dto";
import { RemindersService } from "./reminders.service";

@ApiTags("Reminders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reminders")
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post("test")
  @ApiOperation({ summary: "Test a reminder execution for a client" })
  test(@CurrentUser() currentUser: CurrentUserType, @Body() dto: TestReminderDto) {
    return this.remindersService.test(currentUser, dto);
  }
}
