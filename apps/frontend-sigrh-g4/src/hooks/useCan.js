'use client';

import { usePermissions } from './usePermissions';

export function useCan(permission) {
  const permisos = usePermissions();
  return permisos.includes(permission); // Devuelve true o false
}
