export const ALL_PERMISSIONS = [
  "manage_clients",
  "manage_automations",
  "manage_reports",
  "manage_billing",
  "manage_ai_settings",
  "manage_subscriptions",
  "view_admin_dashboard",
] as const;

export type PermissionType = (typeof ALL_PERMISSIONS)[number];
