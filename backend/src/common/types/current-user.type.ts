import type { PermissionType } from "./permission.type";

export type CurrentUserType = {
  sub: string;
  userId: string;
  businessId: string;
  role: string;
  email: string;
  permissions?: PermissionType[];
};
