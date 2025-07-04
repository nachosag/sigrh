// src/hooks/useCountries.js
import config from '@/config';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/countries`);
        if (response.status != 200) {
          throw new Error('No se pudieron obtener los trabajos');
        }
        setCountries(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaises();
  }, []);

  return { countries, loading, error };
};
