import type { PermissionType } from "../types/permission.type";

export const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  super_admin: [
    "manage_clients",
    "manage_automations",
    "manage_reports",
    "manage_billing",
    "manage_ai_settings",
    "manage_subscriptions",
    "view_admin_dashboard",
  ],
  owner: [
    "manage_clients",
    "manage_automations",
    "manage_reports",
    "manage_billing",
    "manage_ai_settings",
    "manage_subscriptions",
  ],
  business_admin: [
    "manage_clients",
    "manage_automations",
    "manage_reports",
    "manage_billing",
    "manage_ai_settings",
    "manage_subscriptions",
  ],
  admin: [
    "manage_clients",
    "manage_automations",
    "manage_reports",
    "manage_billing",
    "manage_ai_settings",
    "manage_subscriptions",
  ],
  manager: [
    "manage_clients",
    "manage_automations",
    "manage_reports",
    "manage_ai_settings",
  ],
  receptionist: ["manage_clients"],
  operator: ["manage_clients"],
  viewer: [],
};

export function resolvePermissionsForRole(role?: string | null): PermissionType[] {
  if (!role) {
    return [];
  }

  return ROLE_PERMISSIONS[role] ?? [];
}
