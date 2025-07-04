// src/constants/defaultEmployeeForm.js

export const defaultEmployeeForm = {
  id: null, // Para nuevos empleados que no tienen un ID asignado
  user_id: "",
  first_name: "",
  last_name: "",
  dni: "",
  type_dni: "", // Tipo de documento (DU, DNI, etc.)
  personal_email: "",
  active: true, // Por defecto, activo
  role: "", // Aquí podrías definir un valor por defecto si lo deseas
  password: "", // Este sería un campo vacío inicialmente (sería manejado según el contexto, normalmente no mostrarías este valor)
  phone: "",
  salary: "", // Podrías definir un valor por defecto si fuera necesario
  job_id: null, // Si es un nuevo empleado y no tiene un trabajo asignado
  birth_date: "", // Podrías definir un valor por defecto si lo deseas, pero normalmente se deja vacío para que el usuario elija
  hire_date: "", // Lo mismo para la fecha de contratación
  photo: "", // Dejarlo vacío si no tiene foto
  facial_register: "", // Se llena junto con la foto
  address_street: "",
  address_city: "",
  address_cp: "",
  address_state_id: null, // Lo mismo que con los otros valores de dirección
  address_country_id: null, // Aquí puedes poner un ID por defecto si es necesario
  work_histories: [], // Arreglo vacío al principio
  documents: [], // Arreglo vacío al principio
};

export const defaultEmployeeDataForm = {
  id: null, // Para nuevos empleados que no tienen un ID asignado
  first_name: "",
  last_name: "",
  dni: "",
  type_dni: "", // Tipo de documento (DU, DNI, etc.)
  personal_email: "",
  active: true, // Por defecto, activo
  phone: "",
  salary: "", // Podrías definir un valor por defecto si fuera necesario
  job_id: null, // Si es un nuevo empleado y no tiene un trabajo asignado
  birth_date: "", // Podrías definir un valor por defecto si lo deseas, pero normalmente se deja vacío para que el usuario elija
  hire_date: "", // Lo mismo para la fecha de contratación
  photo: "", // Dejarlo vacío si no tiene foto
  facial_register: "", // Se llena junto con la foto
  address_street: "",
  address_city: "",
  address_cp: "",
  address_state_id: null, // Lo mismo que con los otros valores de dirección
  address_country_id: null, // Aquí puedes poner un ID por defecto si es necesario
};
