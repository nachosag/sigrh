// src/hooks/usePayroll.js
import config from "@/config";
import axios from "axios";
import { useState, useEffect } from "react";

export const usePayroll = ({ employee_id, start_date, end_date }) => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const payload = {
      employee_id: employee_id,
      start_date: start_date,
      end_date: end_date,
    };

    const fetchPayroll = async () => {
      try {
        const response = await axios.post(`${config.API_URL}/payroll/`);
        JSON.stringify(payload),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          };
        if (response.status != 200) {
          throw new Error("No se pudieron obtener los empleados");
        }
        setPayroll(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  return { payroll, loading, error };
};
