// src/hooks/useRoles.js
import config from '@/config';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/roles`);
        if (response.status != 200) {
          throw new Error('No se pudieron obtener los trabajos');
        }
        setRoles(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaises();
  }, []);

  return { roles, loading, error };
};
