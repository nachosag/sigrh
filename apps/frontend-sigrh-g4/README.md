¿Como utilizar el front end?

1. Escriba en la consola desde la carpeta general (frontend-sigrh-g4) el comando "npm install" para descargar dependencias.
2. Clone el archivo .env.production y renombra el archivo clonado a ".env.local" (En este se declara el puerto correspondiente al backend, si el backend suyo no está ubicado en el puerto 8000, cambie este número al que corresponda).
3. Una vez finalizada la instalación, ejecute el comando "npm run dev".
4. Abre en el buscador/navegador web la ubicación [http://localhost:3000](http://localhost:3000). Si su puerto no se levanta en el 3000, reemplace el 3000 por el púerto correspondiente.
5. Una vez abierta la página, puede agregar el subdominio "/login" para acceder al login de empleados. URL de ejemplo: http://localhost:3000/login
6. Dentro el sistema hay varios roles, se pueden consultar los accesos de cada rol en el link: https://docs.google.com/spreadsheets/d/1N2R-cp_0bWhuDLFABtlTcx9HfSzuMdxvfqOBBgQ2Y34/edit?usp=sharing. Para pruebas tenemos, de todas formas, un usuario dev.
7. El usuario dev es "bsosa672" y la contraseña es "1234", con este usuario se podrá acceder al sistema y a todas las funcionalidades implementadas, para facilitar la navegación por la página. Este usuario se encuentra en el data entry del backen, por lo que es necesario ejecutar el data entry para que esté habilitado.
8. Si desea probar el reconocimiento facial, este se encuentra por fuera de la página principal, se ubica en http://localhost:3000/face_recognition y desde ahí puede seleccionar entrada o salida. IMPORTANTE: si su puerto del frontend no es el 3000, reemplace el 3000 por el puerto correspondiente.
9. Por último, para realizar postulaciones a una convocatoria, desde http://localhost:3000 encontrará un botón de "Ver oportunidades" que lo llevará a esta sección.
