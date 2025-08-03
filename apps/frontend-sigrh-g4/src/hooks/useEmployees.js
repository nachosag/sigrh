// src/hooks/useEmployees.js
import config from "@/config";
import axios from "axios";
import { useState, useEffect } from "react";

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/employees/`);
        if (response.status != 200) {
          throw new Error("No se pudieron obtener los empleados");
        }
        setEmployees(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, error };
};
