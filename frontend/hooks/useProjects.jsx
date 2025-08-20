import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = async (projectData) => {
        try {
            const newProject = await createProject(projectData);
            setProjects((prev) => [...prev, newProject]);
            return newProject;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    const editProject = async (code, projectData) => {
        try {
            const updatedProject = await updateProject(code, projectData);
            setProjects((prev) =>
                prev.map((p) => (p.code === code ? updatedProject : p))
            );
            return updatedProject;
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    const removeProject = async (code) => {
        try {
            await deleteProject(code);
            setProjects((prev) => prev.filter((p) => p.code !== code));
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    return { projects, loading, error, fetchProjects, addProject, editProject, removeProject };
};
