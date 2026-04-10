const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    post: async (endpoint, data) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    put: async (endpoint, data) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
};
