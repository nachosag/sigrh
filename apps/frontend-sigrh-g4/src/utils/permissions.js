// utils/permissions.js
export const canAccess = (requiredPermissions, userPermissionIds) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions?.some((id) => userPermissionIds?.includes(id));
};
