import { useState, useEffect, useCallback } from 'react';
import { getWorkTypes, createWorkType } from '../api';
import { DEFAULT_WORK_TYPES } from '../constants/workTypes.js';

export const useWorkTypes = () => {
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const seedDefaultWorkTypes = useCallback(async () => {
        try {
            for (const wt of DEFAULT_WORK_TYPES) {
                await createWorkType(wt);
            }
            const data = await getWorkTypes();
            setWorkTypes(data);
        } catch (err) {
            console.error("Error seeding default work types:", err);
            setError(err);
        }
    }, []);

    const fetchWorkTypes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWorkTypes();
            if (!data || data.length === 0) {
                console.log("Database is empty, seeding default work types...");
                await seedDefaultWorkTypes();
            } else {
                setWorkTypes(data);
            }
        } catch (err) {
            setError(err);
            console.error("Failed to fetch work types, using fallback.", err);
            setWorkTypes(DEFAULT_WORK_TYPES); // fallback
        } finally {
            setLoading(false);
        }
    }, [seedDefaultWorkTypes]);

    useEffect(() => {
        fetchWorkTypes();
    }, [fetchWorkTypes]);

    const addWorkType = async (workTypeData) => {
        try {
            const newWorkType = await createWorkType(workTypeData);
            setWorkTypes((prev) => [...prev, newWorkType]);
            return newWorkType;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    return { workTypes, loading, error, fetchWorkTypes, addWorkType };
};