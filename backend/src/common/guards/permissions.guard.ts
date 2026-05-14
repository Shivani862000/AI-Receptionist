import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { PermissionType } from "../types/permission.type";
import { resolvePermissionsForRole } from "../utils/rbac";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { permissions?: PermissionType[]; role?: string } | undefined;
    const permissions = user?.permissions?.length ? user.permissions : resolvePermissionsForRole(user?.role);

    return requiredPermissions.every((permission) => permissions.includes(permission));
  }
}
