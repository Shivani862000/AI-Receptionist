import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { resolvePermissionsForRole } from "../../common/utils/rbac";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: Record<string, any>;
      tenant?: { requestedBusinessId?: string };
    }>();

    if (!request.user) {
      return true;
    }

    const requestedBusinessId = request.tenant?.requestedBusinessId;
    if (!requestedBusinessId || requestedBusinessId === request.user.businessId) {
      request.user.permissions = request.user.permissions ?? resolvePermissionsForRole(request.user.role);
      return true;
    }

    const membership = await this.prisma.businessMembership.findFirst({
      where: {
        userId: request.user.userId,
        businessId: requestedBusinessId,
        status: "active",
      },
    });

    if (!membership) {
      return false;
    }

    request.user.businessId = membership.businessId;
    request.user.role = membership.role;
    request.user.permissions = resolvePermissionsForRole(membership.role);

    return true;
  }
}
