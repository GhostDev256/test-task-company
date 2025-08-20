import { useState, useEffect, useCallback } from 'react';
import { getWorks, createWork, updateWork, deleteWork } from '../api';

export const useWorks = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWorks();
            setWorks(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorks();
    }, [fetchWorks]);

    const addWork = async (workData) => {
        try {
            const newWork = await createWork(workData);
            setWorks((prev) => [...prev, newWork]);
            return newWork;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    const editWork = async (id, workData) => {
        try {
            const updatedWork = await updateWork(id, workData);
            setWorks((prev) =>
                prev.map((w) => (w.id === id ? updatedWork : w))
            );
            return updatedWork;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    const removeWork = async (id) => {
        try {
            await deleteWork(id);
            setWorks((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    return { works, loading, error, fetchWorks, addWork, editWork, removeWork };
};
