export const cleanEmployeePayload = (data) => {
  const fieldsToExclude = [
    "work_histories",
    "documents",
    "job",
    "state",
    "country",
  ];

  const cleaned = { ...data };

  for (const field of fieldsToExclude) {
    delete cleaned[field];
  }

  return cleaned;
};

export const cleanEmployeePayloadFormData = (data) => {
  const fieldsToExclude = [
    "work_histories",
    "documents",
    "job",
    "state",
    "country",
    "password",
    "user_id",
    "role"
  ];

  const cleaned = { ...data };

  for (const field of fieldsToExclude) {
    delete cleaned[field];
  }

  return cleaned;
};

