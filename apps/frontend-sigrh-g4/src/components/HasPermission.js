// components/HasPermission.jsx
"use client";

import { useUser } from "@/contexts/userContext";

/**
 * @param {ReactNode} children - Contenido a renderizar si se cumple el permiso
 * @param {number|string} id - ID del permiso requerido (recomendado: number)
 */
export default function HasPermission({ id, children }) {
  const { role } = useUser();
  const permissionIds = role?.permissions?.map((p) => Number(p.id));
  const hasPermission = permissionIds?.includes(Number(id));

  if (!hasPermission) return null;

  return <>{children}</>;
}
