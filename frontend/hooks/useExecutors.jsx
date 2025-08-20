import { useState, useEffect, useCallback } from 'react';
import { getExecutors, createExecutor } from '../api';

export const useExecutors = () => {
    const [executors, setExecutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExecutors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getExecutors();
            setExecutors(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExecutors();
    }, [fetchExecutors]);

    const addExecutor = async (executorData) => {
        try {
            const newExecutor = await createExecutor(executorData);
            setExecutors((prev) => [...prev, newExecutor]);
            return newExecutor;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    return { executors, loading, error, fetchExecutors, addExecutor };
};
