 import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsDto {
  @ApiProperty()
  totalClients!: number;

  @ApiProperty()
  totalCalls!: number;

  @ApiProperty()
  incomingCalls!: number;

  @ApiProperty()
  outgoingCalls!: number;

  @ApiProperty()
  completedCalls!: number;

  @ApiProperty()
  missedCalls!: number;

  @ApiProperty()
  positiveSentimentCalls!: number;

  @ApiProperty()
  negativeSentimentCalls!: number;

  @ApiProperty()
  totalMessages!: number;

  @ApiProperty()
  activeAutomations!: number;
}
