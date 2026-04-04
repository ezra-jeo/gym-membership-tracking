export type GymViewerRole = "owner" | "admin" | "staff" | "member" | null | undefined;

export type GymViewerProfile = {
  role: GymViewerRole;
  gymId: string | null | undefined;
};

const MANAGEMENT_ROLES = new Set(["owner", "admin", "staff"]);

export function canPreviewUnpublishedGym(
  gymId: string,
  viewer: GymViewerProfile | null | undefined,
): boolean {
  if (!gymId || !viewer) return false;
  if (!viewer.gymId || viewer.gymId !== gymId) return false;

  return !!viewer.role && MANAGEMENT_ROLES.has(viewer.role);
}
