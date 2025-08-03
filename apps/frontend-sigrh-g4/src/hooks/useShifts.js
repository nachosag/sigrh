// src/hooks/useCountry.js
import config from '@/config';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/shift`);
        if (response.status != 200) {
          throw new Error('No se pudieron obtener los turnos');
        }
        setShifts(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaises();
  }, []);

  return { shifts, loading, error };
};
