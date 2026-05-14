import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { ListClientsDto } from "./dto/list-clients.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@ApiTags("Clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: "Create client" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateClientDto) {
    return this.clientsService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List clients" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListClientsDto) {
    return this.clientsService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get client details" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.clientsService.findOne(currentUser, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update client" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(currentUser, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete client" })
  remove(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.clientsService.remove(currentUser, id);
  }
}
