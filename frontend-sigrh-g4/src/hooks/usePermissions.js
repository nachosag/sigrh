// app/hooks/usePermissions.js

'use client';

import { useState, useEffect } from 'react';

export function usePermissions() {
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    // Aquí simulas la obtención de permisos desde un backend o contexto global
    const permisosUsuario = ['view_salary', 'edit', 'delete']; // Ejemplo de permisos
    setPermisos(permisosUsuario);
  }, []);

  return permisos;
}
