// src/hooks/useCountry.js
import config from '@/config';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const useSectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/sectors`);
        if (response.status != 200) {
          throw new Error('No se pudieron obtener los trabajos');
        }
        setSectors(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return { sectors, loading, error };
};
