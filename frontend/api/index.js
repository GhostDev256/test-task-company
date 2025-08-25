const API_URL = 'https://portfolioghostdev.online/api'; /* http://localhost:5000/api */

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData = 'Something went wrong';
        const responseText = await response.text();
    
        try {
            const json = JSON.parse(responseText);

            if (json.error) {
                errorData = json.error;
            } else {
                const errorMessages = Object.entries(json)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('; ');
                errorData = errorMessages || 'Something went wrong with form validation.';
            }
        } catch (e) {
            errorData = responseText || 'Something went wrong';
        }
        
        console.error(`Server returned status ${response.status}: ${errorData}`);
        throw new Error(errorData);
    }
    
    if (response.status === 204) {
        return null;
    }

    return response.json();
};
    
export const getProjects = async () => {
    const response = await fetch(`${API_URL}/projects`);
    return handleResponse(response);
};

export const getProjectByCode = async (code) => {
    const response = await fetch(`${API_URL}/projects/${code}`);
    return handleResponse(response);
};

export const createProject = async (projectData) => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
        credentials: 'include',
    });
    return handleResponse(response);
};


export const updateProject = async (code, projectData) => {
    const response = await fetch(`${API_URL}/projects/${code}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteProject = async (code) => {
    const response = await fetch(`${API_URL}/projects/${code}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

export const getWorks = async () => {
    const response = await fetch(`${API_URL}/works`);
    return handleResponse(response);
};

export const getWorkById = async (id) => {
    const response = await fetch(`${API_URL}/works/${id}`);
    return handleResponse(response);
};

export const createWork = async (workData) => {
    const response = await fetch(`${API_URL}/works`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(workData),
    });
    return handleResponse(response);
};

export const updateWork = async (id, workData) => {
    const response = await fetch(`${API_URL}/works/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(workData),
    });
    return handleResponse(response);
};

export const deleteWork = async (id) => {
    const response = await fetch(`${API_URL}/works/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

export const getWorkTypes = async () => {
    const response = await fetch(`${API_URL}/work_types`);
    return handleResponse(response);
};

export const createWorkType = async (workTypeData) => {
    const response = await fetch(`${API_URL}/work_types`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(workTypeData),
    });
    return handleResponse(response);
};

export const getExecutors = async () => {
    const response = await fetch(`${API_URL}/executors`);
    return handleResponse(response);
};

export const createExecutor = async (executorData) => {
    const response = await fetch(`${API_URL}/executors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(executorData),
    });
    return handleResponse(response);
};

export const seedData = async () => {
    const response = await fetch(`${API_URL}/seed_data`, {
        method: 'POST',
    });
    return handleResponse(response);
};